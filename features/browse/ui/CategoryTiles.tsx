import type { BrowseCategory } from "../browse.types";
import { formatViewerLabel } from "../format";
import styles from "./browse.module.css";

type CategoryTilesProps = {
  categories: BrowseCategory[];
};

export function CategoryTiles({ categories }: CategoryTilesProps) {
  return (
    <section aria-labelledby="category-tiles-title">
      <h2 id="category-tiles-title" className={styles.sectionTitle}>
        Categories
      </h2>
      {categories.length === 0 ? (
        <p className={styles.empty}>No categories to browse yet.</p>
      ) : (
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <a
              key={category.id}
              className={styles.categoryTile}
              href={`/category/${category.slug}`}
            >
              <img
                className={styles.categoryImage}
                src={category.imageUrl}
                alt=""
                width={320}
                height={180}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.categoryOverlay}>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryViewers}>
                  {formatViewerLabel(category.viewerCount)}
                </span>
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
