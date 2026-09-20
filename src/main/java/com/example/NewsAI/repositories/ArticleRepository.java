package com.example.NewsAI.repositories;

import com.example.NewsAI.entities.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import com.example.NewsAI.enums.ArticleStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    List<Article> findByAuthorId(Long authorId);

    List<Article> findByStatusInOrderByCreatedAtDesc(List<ArticleStatus> statuses);

    List<Article> findByStatusOrderByCreatedAtAsc(ArticleStatus status);

    @Query("SELECT a FROM Article a WHERE a.status IN :statuses AND "
            + "(LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) "
            + "OR LOWER(a.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Article> searchPublished(@Param("query") String query,
                                  @Param("statuses") List<ArticleStatus> statuses,
                                  Pageable pageable);
}
