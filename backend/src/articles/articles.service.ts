import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Article } from './article.entity';
import {
  ArticleTranslation,
  ArticleLanguage,
} from './article-translation.entity';
import { ArticleImage } from './article-image.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesDto } from './dto/list-articles.dto';
import {
  SUPPORTED_LANGUAGES,
  UpsertTranslationDto,
} from './dto/translation.dto';
import { CategoriesService } from '../categories/categories.service';
import { LocationsService } from '../locations/locations.service';
import { MediaService } from '../media/media.service';
import { WebhookService } from '../webhook/webhook.service';
import { SocialService } from '../social/social.service';

const slugify = (text: string) => {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\sऀ-ॿ਀-੿-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return base.slice(0, 200);
};

// Trim and coerce blank SEO inputs to null so we store clean nulls, not ''.
const emptyToNull = (v?: string | null): string | null => {
  const t = (v ?? '').trim();
  return t === '' ? null : t;
};

const publicViews = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return 100 + (Math.abs(h) % 101);
};

const maskViews = <T extends { id: string; views: number }>(a: T): T => {
  a.views = publicViews(a.id);
  return a;
};

const applyLang = (article: Article, lang: ArticleLanguage): Article => {
  if (lang === 'en') return article;
  const t = (article.translations || []).find((x) => x.language === lang);
  if (t) {
    article.title = t.title;
    article.slug = t.slug || article.slug;
    article.description = t.description;
    article.content = t.content;
  }
  return article;
};

@Injectable()
export class ArticlesService implements OnModuleInit {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private readonly repo: Repository<Article>,
    @InjectRepository(ArticleTranslation)
    private readonly translationRepo: Repository<ArticleTranslation>,
    @InjectRepository(ArticleImage)
    private readonly imageRepo: Repository<ArticleImage>,
    private readonly categoriesService: CategoriesService,
    private readonly locationsService: LocationsService,
    private readonly mediaService: MediaService,
    private readonly webhookService: WebhookService,
    private readonly socialService: SocialService,
  ) {}

  async onModuleInit() {
    try {
      const result = await this.repo
        .createQueryBuilder()
        .update(Article)
        .set({ published_at: () => '"created_at"' })
        .where('published_at IS NULL')
        .execute();
      if (result.affected) {
        this.logger.log(
          `Backfilled published_at on ${result.affected} legacy article(s)`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `published_at backfill skipped: ${(err as Error).message}`,
      );
    }
  }

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title) || 'article';
    let slug = base;
    let counter = 1;
    while (
      await this.repo.findOne({
        where: excludeId ? { slug, id: Not(excludeId) } : { slug },
      })
    ) {
      slug = `${base}-${counter}`;
      counter += 1;
    }
    return slug;
  }

  private async generateUniqueTranslationSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugify(title) || 'article';
    let slug = base;
    let counter = 1;
    while (
      await this.translationRepo.findOne({
        where: excludeId ? { slug, id: Not(excludeId) } : { slug },
      })
    ) {
      slug = `${base}-${counter}`;
      counter += 1;
    }
    return slug;
  }

  async create(
    dto: CreateArticleDto,
    file?: Express.Multer.File,
  ): Promise<Article> {
    let imageUrl: string | undefined;
    if (file?.buffer) {
      const uploaded = await this.mediaService.uploadBuffer(
        file.buffer,
        file.originalname,
      );
      if (uploaded) imageUrl = uploaded;
    } else if (dto.image_url?.trim()) {
      imageUrl = this.mediaService.watermarkUrl(dto.image_url.trim());
    }

    const slug = await this.generateUniqueSlug(dto.slug?.trim() || dto.title);
    const categories = dto.category_ids?.length
      ? await this.categoriesService.findByIds(dto.category_ids)
      : [];
    const locations = dto.location_ids?.length
      ? await this.locationsService.findByIds(dto.location_ids)
      : [];

    const article = this.repo.create({
      title: dto.title,
      slug,
      description: dto.description,
      content: dto.content,
      author: dto.author,
      image_url: imageUrl,
      published: dto.published ?? true,
      published_at: dto.published_at ? new Date(dto.published_at) : new Date(),
      display_order:
        dto.display_order === undefined ? null : dto.display_order,
      meta_title: emptyToNull(dto.meta_title),
      meta_description: emptyToNull(dto.meta_description),
      focus_keyword: emptyToNull(dto.focus_keyword),
      canonical_url: emptyToNull(dto.canonical_url),
      categories,
      locations,
    });

    const saved = await this.repo.save(article);

    if (saved.published) {
      const publicUrl = `${process.env.PUBLIC_SITE_URL || ''}/article/${saved.slug}`;
      const payload = {
        id: saved.id,
        title: saved.title,
        slug: saved.slug,
        description: saved.description,
        image_url: saved.image_url,
        url: publicUrl,
        categories: categories.map((c) => c.name),
        locations: locations.map((l) => l.name),
        published_at: saved.created_at.toISOString(),
      };
      await this.webhookService.dispatch(payload);
      const targets = {
        x: !!dto.post_to_x,
        facebook: !!dto.post_to_facebook,
        instagram: !!dto.post_to_instagram,
      };
      if (targets.x || targets.facebook || targets.instagram) {
        await this.socialService.dispatch(payload, targets);
      }
    }

    return saved;
  }

  async list(query: ListArticlesDto) {
    const lang = query.lang || 'en';

    const qb = this.repo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.categories', 'category')
      .leftJoinAndSelect('article.locations', 'location')
      .leftJoinAndSelect('article.translations', 'translation')
      .leftJoinAndSelect('article.images', 'image')
      .orderBy('article.display_order', 'ASC', 'NULLS LAST')
      .addOrderBy('article.published_at', 'DESC', 'NULLS LAST')
      .addOrderBy('article.created_at', 'DESC');
    // NOTE: do NOT order by image.position here. TypeORM 0.3 disables its
    // distinct-paging when ORDER BY references a joined alias, applying
    // LIMIT to the joined cartesian product. That collapses N pages into
    // a handful of distinct articles. Image order is handled per-article
    // in the detail endpoint.

    if (!query.includeUnpublished) {
      qb.andWhere('article.published = :p', { p: true });
    }

    if (query.q) {
      qb.andWhere(
        '(LOWER(article.title) LIKE :q OR LOWER(translation.title) LIKE :q)',
        { q: `%${query.q.toLowerCase()}%` },
      );
    }

    if (query.category) {
      qb.andWhere(
        '(category.slug = :catKey OR category.id::text = :catKey)',
        { catKey: query.category },
      );
    }

    if (query.location) {
      qb.andWhere(
        '(location.slug = :locKey OR location.id::text = :locKey)',
        { locKey: query.location },
      );
    }

    if (query.date_from) {
      qb.andWhere(
        'COALESCE(article.published_at, article.created_at) >= :dateFrom',
        { dateFrom: query.date_from },
      );
    }

    if (query.date_to) {
      qb.andWhere(
        'COALESCE(article.published_at, article.created_at) <= :dateTo',
        { dateTo: query.date_to },
      );
    }
    // COALESCE is OK in WHERE; TypeORM only mis-parses dotted refs in ORDER BY.

    // No language gate: every published article appears in every language.
    // applyLang() swaps in the translated fields when present and falls back
    // to the English source otherwise.

    qb.skip(query.offset || 0).take(query.limit || 20);

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((a) => maskViews(applyLang(a, lang))),
      total,
    };
  }

  async latest(limit = 10, lang: ArticleLanguage = 'en') {
    const qb = this.repo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.translations', 'translation')
      .where('article.published = :p', { p: true })
      .orderBy('article.display_order', 'ASC', 'NULLS LAST')
      .addOrderBy('article.published_at', 'DESC', 'NULLS LAST')
      .addOrderBy('article.created_at', 'DESC')
      .take(limit);

    if (lang !== 'en') {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM article_translations t_filter
          WHERE t_filter.article_id = article.id
          AND t_filter.language = :langFilter
        )`,
        { langFilter: lang },
      );
    }

    const items = await qb.getMany();
    return items.map((a) => maskViews(applyLang(a, lang)));
  }

  async findBySlug(slug: string, lang: ArticleLanguage = 'en') {
    const RELS = ['categories', 'locations', 'translations', 'images'];
    let article = await this.repo.findOne({
      where: { slug },
      relations: RELS,
    });
    if (!article) {
      const t = await this.translationRepo.findOne({
        where: { slug },
        relations: ['article'],
      });
      if (t?.article) {
        article = await this.repo.findOne({
          where: { id: t.article_id },
          relations: RELS,
        });
        if (article && !lang) lang = t.language;
      }
    }
    if (!article) throw new NotFoundException('Article not found');
    if (article.images) {
      article.images = article.images
        .slice()
        .sort((a, b) => a.position - b.position);
    }
    this.repo
      .increment({ id: article.id }, 'views', 1)
      .catch((e) => this.logger.warn(`views increment failed: ${e?.message}`));
    return maskViews(applyLang(article, lang));
  }

  async findById(id: string) {
    const article = await this.repo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async related(slug: string, limit = 5, lang: ArticleLanguage = 'en') {
    let article = await this.repo.findOne({
      where: { slug },
      relations: ['categories'],
    });
    if (!article) {
      const t = await this.translationRepo.findOne({
        where: { slug },
        relations: ['article'],
      });
      if (t?.article) {
        article = await this.repo.findOne({
          where: { id: t.article_id },
          relations: ['categories'],
        });
      }
    }
    if (!article) return [];
    const categoryIds = (article.categories || []).map((c) => c.id);
    if (categoryIds.length === 0) return [];

    const items = await this.repo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.categories', 'category')
      .leftJoinAndSelect('article.locations', 'location')
      .leftJoinAndSelect('article.translations', 'translation')
      .leftJoinAndSelect('article.images', 'image')
      .where('article.id != :id', { id: article.id })
      .andWhere('article.published = true')
      .andWhere('category.id IN (:...cats)', { cats: categoryIds })
      .orderBy('article.created_at', 'DESC')
      .take(limit)
      .getMany();
    return items.map((a) => maskViews(applyLang(a, lang)));
  }

  async update(
    id: string,
    dto: UpdateArticleDto,
    file?: Express.Multer.File,
  ): Promise<Article> {
    const article = await this.findById(id);

    // Explicit slug edit wins; otherwise regenerate from a changed title.
    if (dto.slug?.trim()) {
      article.slug = await this.generateUniqueSlug(dto.slug.trim(), id);
      if (dto.title) article.title = dto.title;
    } else if (dto.title && dto.title !== article.title) {
      article.title = dto.title;
      article.slug = await this.generateUniqueSlug(dto.title, id);
    } else if (dto.title) {
      article.title = dto.title;
    }
    if (dto.meta_title !== undefined) {
      article.meta_title = emptyToNull(dto.meta_title);
    }
    if (dto.meta_description !== undefined) {
      article.meta_description = emptyToNull(dto.meta_description);
    }
    if (dto.focus_keyword !== undefined) {
      article.focus_keyword = emptyToNull(dto.focus_keyword);
    }
    if (dto.canonical_url !== undefined) {
      article.canonical_url = emptyToNull(dto.canonical_url);
    }
    if (dto.description !== undefined) article.description = dto.description;
    if (dto.content !== undefined) article.content = dto.content;
    if (dto.author !== undefined) article.author = dto.author;
    if (dto.published !== undefined) article.published = dto.published;
    if (dto.published_at !== undefined) {
      article.published_at = dto.published_at
        ? new Date(dto.published_at)
        : null;
    }
    if (dto.display_order !== undefined) {
      article.display_order = dto.display_order;
    }

    if (dto.category_ids) {
      article.categories = await this.categoriesService.findByIds(
        dto.category_ids,
      );
    }
    if (dto.location_ids) {
      article.locations = await this.locationsService.findByIds(
        dto.location_ids,
      );
    }

    if (file?.buffer) {
      const uploaded = await this.mediaService.uploadBuffer(
        file.buffer,
        file.originalname,
      );
      if (uploaded) article.image_url = uploaded;
    } else if (dto.image_url?.trim()) {
      article.image_url = this.mediaService.watermarkUrl(dto.image_url.trim());
    }

    return this.repo.save(article);
  }

  async remove(id: string) {
    const article = await this.findById(id);
    await this.repo.remove(article);
    return { deleted: true };
  }

  async reorder(items: { id: string; display_order: number | null }[]) {
    if (!Array.isArray(items)) {
      throw new BadRequestException('items array required');
    }
    for (const it of items) {
      if (!it?.id) continue;
      await this.repo.update(
        { id: it.id },
        {
          display_order:
            it.display_order === null || it.display_order === undefined
              ? null
              : Number(it.display_order),
        },
      );
    }
    return { updated: items.length };
  }

  async stats() {
    const total = await this.repo.count();
    const published = await this.repo.count({ where: { published: true } });
    const totalViewsRaw = await this.repo
      .createQueryBuilder('article')
      .select('SUM(article.views)', 'sum')
      .getRawOne<{ sum: string | null }>();
    return {
      total_articles: total,
      published_articles: published,
      total_views: parseInt(totalViewsRaw?.sum || '0', 10),
    };
  }

  async analytics() {
    const perDay = await this.repo
      .createQueryBuilder('article')
      .select(
        "to_char(date_trunc('day', article.created_at), 'YYYY-MM-DD')",
        'day',
      )
      .addSelect('COUNT(*)::int', 'count')
      .where("article.created_at > NOW() - INTERVAL '30 days'")
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; count: number }>();

    const byCategory = await this.repo
      .createQueryBuilder('article')
      .leftJoin('article.categories', 'category')
      .select('category.name', 'name')
      .addSelect('COUNT(DISTINCT article.id)::int', 'count')
      .where('category.name IS NOT NULL')
      .groupBy('category.name')
      .orderBy('count', 'DESC')
      .getRawMany<{ name: string; count: number }>();

    const byLocation = await this.repo
      .createQueryBuilder('article')
      .leftJoin('article.locations', 'location')
      .select('location.name', 'name')
      .addSelect('COUNT(DISTINCT article.id)::int', 'count')
      .where('location.name IS NOT NULL')
      .groupBy('location.name')
      .orderBy('count', 'DESC')
      .getRawMany<{ name: string; count: number }>();

    const topArticles = await this.repo
      .createQueryBuilder('article')
      .select(['article.id', 'article.title', 'article.slug', 'article.views'])
      .where('article.published = true')
      .orderBy('article.views', 'DESC')
      .limit(5)
      .getMany();

    const langCount = await this.translationRepo
      .createQueryBuilder('t')
      .select('t.language', 'language')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('t.language')
      .getRawMany<{ language: string; count: number }>();

    const totalArticles = await this.repo.count();
    const byLanguage = [
      { language: 'en', count: totalArticles },
      ...langCount,
    ];

    return {
      per_day: perDay,
      by_category: byCategory,
      by_location: byLocation,
      top_articles: topArticles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        views: publicViews(a.id),
      })),
      by_language: byLanguage,
    };
  }

  async listTranslations(articleId: string) {
    await this.findById(articleId);
    return this.translationRepo.find({
      where: { article_id: articleId },
      order: { language: 'ASC' },
    });
  }

  async upsertTranslation(articleId: string, dto: UpsertTranslationDto) {
    await this.findById(articleId);
    if (!SUPPORTED_LANGUAGES.includes(dto.language)) {
      throw new BadRequestException('Unsupported language');
    }
    const existing = await this.translationRepo.findOne({
      where: { article_id: articleId, language: dto.language },
    });
    const slug = await this.generateUniqueTranslationSlug(
      dto.title,
      existing?.id,
    );
    if (existing) {
      existing.title = dto.title;
      existing.slug = slug;
      existing.description = dto.description ?? '';
      existing.content = dto.content;
      return this.translationRepo.save(existing);
    }
    const created = this.translationRepo.create({
      article_id: articleId,
      language: dto.language,
      title: dto.title,
      slug,
      description: dto.description ?? '',
      content: dto.content,
    });
    return this.translationRepo.save(created);
  }

  async deleteTranslation(articleId: string, language: ArticleLanguage) {
    const t = await this.translationRepo.findOne({
      where: { article_id: articleId, language },
    });
    if (!t) throw new NotFoundException('Translation not found');
    await this.translationRepo.remove(t);
    return { deleted: true };
  }

  async listImages(articleId: string) {
    await this.findById(articleId);
    return this.imageRepo.find({
      where: { article_id: articleId },
      order: { position: 'ASC' },
    });
  }

  async addImages(articleId: string, files: Express.Multer.File[]) {
    await this.findById(articleId);
    if (!files?.length) throw new BadRequestException('No files provided');
    const existing = await this.imageRepo.count({
      where: { article_id: articleId },
    });
    const created: ArticleImage[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const f = files[i];
      const url = await this.mediaService.uploadBuffer(f.buffer, f.originalname);
      if (!url) continue;
      const img = this.imageRepo.create({
        article_id: articleId,
        url,
        position: existing + i,
      });
      created.push(await this.imageRepo.save(img));
    }
    return created;
  }

  async addImageUrl(articleId: string, url: string, alt?: string) {
    await this.findById(articleId);
    const existing = await this.imageRepo.count({
      where: { article_id: articleId },
    });
    const img = this.imageRepo.create({
      article_id: articleId,
      url: this.mediaService.watermarkUrl(url),
      alt,
      position: existing,
    });
    return this.imageRepo.save(img);
  }

  async deleteImage(articleId: string, imageId: string) {
    const img = await this.imageRepo.findOne({
      where: { id: imageId, article_id: articleId },
    });
    if (!img) throw new NotFoundException('Image not found');
    await this.imageRepo.remove(img);
    return { deleted: true };
  }
}
