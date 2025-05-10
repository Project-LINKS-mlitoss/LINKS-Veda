ALTER TABLE `schema_configs`
    RENAME TO  `content_configs` ;

ALTER TABLE `preprocess_schema_configs`
    RENAME TO  `preprocess_content_configs` ;

ALTER TABLE `cross_join_schema_configs`
    RENAME TO  `cross_join_content_configs` ;

ALTER TABLE `text_matching_schema_configs`
    RENAME TO  `text_matching_content_configs` ;

ALTER TABLE `spatial_join_schema_configs`
    RENAME TO  `spatial_join_content_configs` ;

ALTER TABLE `spatial_aggregate_schema_configs`
    RENAME TO  `spatial_aggregate_content_configs` ;