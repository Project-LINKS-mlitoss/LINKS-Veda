import {
	useActionData,
	useFetcher,
	useLocation,
	useParams,
	useSubmit,
} from "@remix-run/react";
import { Dropdown, type MenuProps, Table, type TableColumnType } from "antd";
import { Pagination } from "antd";
import Spin from "app/components/atoms/Spin";
import _ from "lodash";
import { memo, useEffect, useMemo, useState } from "react";
import { CONTENT_FIELD_TYPE, type SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import notification from "~/components/atoms/Notification";
import {
	DefaultCurrent,
	DefaultPageSize,
	PageSizeOptions,
} from "~/components/molecules/Common";
import { formatDate } from "~/components/molecules/Common/utils";
import { InsertColumnModal } from "~/components/pages/Content/ContentDetail/Modal/InsertColumnModal";
import { InsertRowModal } from "~/components/pages/Content/ContentDetail/Modal/InsertRowModal";
import { TableCell } from "~/components/pages/Content/ContentDetail/TableCell";
import { TableHeaderCell } from "~/components/pages/Content/ContentDetail/TableHeaderCell";
import {
	CellWrapperStyled,
	ContentItemTable,
} from "~/components/pages/Content/styles";
import {
	CELL_MODE,
	type ContentItemForCreate,
	type DataTableContentType,
	FIELD_TYPE,
	type FieldPossibleValue,
	type OnFieldChange,
	type OnItemChange,
	type RenderCellComponent,
	type RenderContentField,
	type TableItem,
	type TableItemField,
	type onDeleteRow,
} from "~/components/pages/Content/types";
import { ACTION_TYPES_CONTENT, type ContentItem } from "~/models/content";
import type { Item, ItemModel, ItemsResponse } from "~/models/items";
import type { ApiResponse, SuccessResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { getMaxContentField } from "~/utils/common";

interface ContentDetailFilter {
	page: number;
	perPage: number;
}

type Props = {
	fetchData?: ApiResponse<ItemsResponse>;
	contentDetail: ContentItem;
	setSelectedRowId?: (val: SelectRowIdT | null) => void;
	contentItems?: DataTableContentType[];
	setContentItems?: (val: DataTableContentType[]) => void;
	updateParams?: (params: Record<string, string>) => void;
	filter?: ContentDetailFilter;
};

export const TableItems = ({
	fetchData,
	contentDetail,
	setSelectedRowId,
	contentItems,
	setContentItems,
	updateParams,
	filter: externalFilter,
}: Props) => {
	const submit = useSubmit();
	const { contentId } = useParams();
	const location = useLocation();
	const fetch = useFetcher<ApiResponse<ItemsResponse>>();
	const isLoadItem = fetch.state === "loading";
	const actionData = useActionData<ApiResponse<null>>();

	const isGeoJson = contentDetail
		? contentDetail?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	const [isSaving, setIsSaving] = useState(false);
	const [items, setItems] = useState<ItemModel[]>([]);
	const [itemsForUpdate, setItemsForUpdate] = useState<ItemModel[]>([]);
	const [renderFields, setRenderFields] = useState<RenderContentField[]>(
		formatFields(),
	);
	const [renderItems, setRenderItems] = useState<TableItem[]>(formatItems());
	const [filters, setFilters] = useState({
		page: DefaultCurrent,
		perPage: DefaultPageSize,
	});

	useEffect(() => {
		if (!contentDetail?.id || externalFilter || fetchData) return;
		fetch.load(
			`${routes.item}?modelId=${contentDetail?.id}&page=${filters?.page}&perPage=${filters?.perPage}`,
		);
	}, [contentDetail?.id, filters, fetchData, externalFilter, fetch.load]);

	useEffect(() => {
		const newItems = fetchData?.status
			? fetchData.data.items
			: fetch?.data?.status
				? fetch.data.data?.items
				: null;

		if (newItems) {
			setItems(newItems);
		}
	}, [fetchData, fetch?.data]);

	const totalPage = useMemo(() => {
		return fetchData?.status
			? fetchData.data.totalCount
			: fetch?.data?.status
				? fetch.data.data.totalCount
				: 0;
	}, [fetchData, fetch]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setRenderItems(formatItems);
		setRenderFields(formatFields);
		setItemsForUpdate(items);
	}, [items, contentDetail]);

	// Initial data
	function formatItems() {
		const displayFields = renderFields.map((field) => field.key);
		return items.map((item) => {
			const existingFields =
				item?.fields
					?.filter(
						(field) =>
							field?.type !== FIELD_TYPE.GeometryObject &&
							(!displayFields.length || displayFields.includes(field.key)),
					)
					?.map((field) => ({
						...field,
						originalValue: formatValue(field?.type, field?.value),
						value: formatValue(field?.type, field?.value),
						prevMode: CELL_MODE.DEFAULT,
						mode: CELL_MODE.DEFAULT,
					})) || [];

			const contentFields = contentDetail?.schema?.fields?.filter(
				(field) =>
					field?.type !== FIELD_TYPE.GeometryObject &&
					(!displayFields.length || displayFields.includes(field.key)),
			);

			const existingFieldIds = new Set(
				existingFields.map((field) => field?.id),
			);

			const allFields = [...existingFields];

			for (const field of contentFields) {
				if (!existingFieldIds?.has(field?.id)) {
					allFields.push({
						...field,
						originalValue: "",
						prevMode: CELL_MODE.NO_DATA,
						mode: CELL_MODE.NO_DATA,
						value: "",
					});
				}
			}

			return {
				...item,
				fields: allFields,
				fieldsKey: _.keyBy(allFields, "id"),
				prevMode: CELL_MODE.DEFAULT,
				mode: CELL_MODE.DEFAULT,
			};
		});
	}

	function formatFields(): RenderContentField[] {
		return getMaxContentField(contentDetail?.schema?.fields ?? []).map(
			(field) => {
				const isArray = Array.isArray(
					items[0]?.fields?.filter((f) => f?.id === field?.id)[0]?.value,
				);
				return {
					...field,
					originalKey: field?.key,
					prevMode: CELL_MODE.DEFAULT,
					mode: CELL_MODE.DEFAULT,
					multiple: isArray,
				};
			},
		);
	}

	// Columns table
	function getColumns({
		fields,
		onItemChange,
		onFieldChange,
		onDeleteRow,
	}: {
		fields: RenderContentField[];
		onItemChange: OnItemChange;
		onFieldChange: OnFieldChange;
		onDeleteRow: onDeleteRow;
	}): TableColumnType<TableItem>[] {
		const columns: TableColumnType<TableItem>[] = [];

		if (contentId) {
			columns?.push({
				title: null,
				render: (tableItem: TableItem) => {
					const items: MenuProps["items"] = [
						tableItem?.mode === CELL_MODE.DELETED
							? {
									label: "復元",
									key: "restore",
									onClick: () => {
										onDeleteRow(tableItem);
									},
								}
							: {
									label: "削除",
									key: "delete",
									onClick: () => {
										onDeleteRow(tableItem);
									},
								},
					];

					return (
						<CellWrapperStyled mode={tableItem?.mode}>
							<Dropdown menu={{ items }} trigger={["click"]} className="action">
								<Icon icon="textLeft" size={16} />
							</Dropdown>
						</CellWrapperStyled>
					);
				},
				width: 20,
			});
		}

		if (fields && Array.isArray(fields)) {
			columns?.push(
				...fields.map((field) => ({
					title: () => (
						<TableHeaderCell field={field} onFieldChange={onFieldChange} />
					),
					width: 150,
					render: (tableItem: TableItem) => {
						const cellProps = {
							fieldValue: tableItem?.fieldsKey[field?.id],
							itemId: tableItem?.id,
							field,
							onItemChange,
						};
						return <CellWrapper {...cellProps} />;
					},
				})),
			);
		}

		return columns;
	}

	// Function for table
	const onItemChange: OnItemChange = ({ itemId, field, value }) => {
		setRenderItems(
			renderItems.map((item) => {
				if (itemId === item?.id) {
					const newItem = _.cloneDeep(item);
					const updatedValue =
						_.isArray(newItem?.fieldsKey[field?.id]?.originalValue) ||
						field?.type === FIELD_TYPE.Multiple
							? (value as string)?.split?.(",")
							: value;
					const originalValue = _.get(
						item,
						`fieldsKey.${field?.id}.originalValue`,
					);
					const mode = _.get(item, `fieldsKey.${field?.id}.mode`);

					_.set(newItem, `fieldsKey.${field?.id}.value`, updatedValue);

					if (
						mode === CELL_MODE.DEFAULT ||
						mode === CELL_MODE.EDITED ||
						mode === CELL_MODE.NO_DATA
					) {
						_.set(
							newItem,
							`fieldsKey.${field?.id}.mode`,
							originalValue?.toString() !== updatedValue?.toString()
								? CELL_MODE.EDITED
								: CELL_MODE.DEFAULT,
						);
					}

					return newItem;
				}
				return item;
			}),
		);
	};

	const onFieldChange = (field: RenderContentField) => {
		setRenderFields((prevFields) =>
			prevFields
				.map((_field) => {
					if (field?.id === _field?.id) {
						const updateField = _.cloneDeep(_field);

						_.set(updateField, "key", field?.key);

						if (field.mode === CELL_MODE.DELETED) {
							_.set(updateField, "mode", CELL_MODE.DELETED);
							_.set(updateField, "prevMode", _field?.mode);
						} else if (_field?.mode === CELL_MODE.DELETED) {
							_.set(updateField, "mode", field?.prevMode);
						} else {
							if (_field?.originalKey !== field?.key) {
								_.set(updateField, "mode", CELL_MODE.EDITED);
							} else {
								_.set(updateField, "mode", CELL_MODE.DEFAULT);
							}
						}

						setRenderItems((prevItems) =>
							prevItems.map((item) => ({
								...item,
								fieldsKey: {
									...item?.fieldsKey,
									[field?.id]: {
										...item?.fieldsKey[field?.id],
										key: field?.key,
										// mode: updateField?.mode,
									},
								},
							})),
						);

						return updateField;
					}

					return _field;
				})
				.filter((field) => !_.isNil(field)),
		);
	};

	const onDeleteRow = (tableItem: TableItem) => {
		setRenderItems(
			renderItems?.map((item) => {
				if (tableItem?.id === item?.id) {
					const newItem = _.cloneDeep(item);
					const mode = _.get(item, "mode");

					_.set(
						newItem,
						"mode",
						mode === CELL_MODE.DELETED
							? tableItem?.prevMode
							: CELL_MODE.DELETED,
					);

					const fieldsKey = _.get(item, "fieldsKey", {}) as Record<
						string,
						TableItemField
					>;

					const updatedFieldsKey = Object.keys(fieldsKey).reduce(
						(acc, key) => {
							const field = fieldsKey[key];
							acc[key] = {
								...field,
								mode:
									field?.mode === CELL_MODE.DELETED
										? field?.prevMode
										: CELL_MODE.DELETED,
								prevMode: field?.mode,
							};
							return acc;
						},
						{} as Record<string, TableItemField>,
					);

					_.set(newItem, "fieldsKey", updatedFieldsKey);

					const fields = _.get(item, "fields", []) as Array<TableItemField>;

					const updatedFields = fields?.map((field) => {
						return {
							...field,
							mode:
								field?.mode === CELL_MODE.DELETED
									? field?.prevMode
									: CELL_MODE.DELETED,
							prevMode: field?.mode,
						};
					});

					_.set(newItem, "fields", updatedFields);

					return newItem;
				}
				return item;
			}),
		);
	};

	const onAddRow = (items: Item[]) => {
		if (items.length) {
			setItemsForUpdate((prev) => [...prev, ...items]);

			const newRows = items?.map((item) => {
				const newRowFields: TableItemField[] = renderFields?.map((field) => {
					let fieldValue: string | null | boolean =
						item?.fields?.find(
							(i) => i?.key === field?.key && i?.type === field?.type,
						)?.value ?? null;

					if (field?.type === FIELD_TYPE.Bool && _.isNil(fieldValue)) {
						fieldValue = false;
					}

					return {
						id: field?.id,
						key: field?.key,
						type: field?.type,
						value: formatValue(field?.type as FIELD_TYPE, fieldValue),
						prevMode: CELL_MODE.NEW,
						mode: CELL_MODE.NEW,
					};
				});

				return {
					modelId: contentDetail?.id,
					fields: newRowFields,
					fieldsKey: _.keyBy(newRowFields, "id"),
					createdAt: new Date().toISOString(),
					isMetadata: false,
					id: item?.id,
					prevMode: CELL_MODE.NEW,
					mode: CELL_MODE.NEW,
				} as ContentItemForCreate;
			});

			setRenderItems([...renderItems, ...newRows]);
		}
	};

	const onAddColumn = ({
		initialValue,
		contentName,
		type,
	}: {
		initialValue: string;
		contentName: string;
		type: string;
	}) => {
		const newField: RenderContentField = {
			key: contentName,
			id: Date.now().toString(),
			type: type,
			multiple: type === FIELD_TYPE.Multiple,
			required: false,
			prevMode: CELL_MODE.NEW,
			mode: CELL_MODE.NEW,
			originalKey: contentName,
		};
		setRenderFields([...renderFields, newField]);
		setRenderItems(
			renderItems?.map((item) => {
				return {
					...item,
					fieldsKey: {
						...item?.fieldsKey,
						[newField.id]: {
							id: newField?.id,
							key: newField?.key,
							value: formatValue(
								newField?.type as FIELD_TYPE,
								initialValue ?? "",
							),
							type: newField?.type,
							prevMode: CELL_MODE.NEW,
							mode:
								item?.mode === CELL_MODE.DELETED
									? CELL_MODE.DELETED
									: CELL_MODE.NEW,
						},
					},
				} as TableItem;
			}),
		);
	};

	const handleFilterChange = (page: number, perPage: number) => {
		setFilters({ page, perPage });
		updateParams?.({ page: page.toString(), perPage: perPage.toString() });
	};

	const handleRowClick = (record: TableItem) => {
		if (setSelectedRowId) {
			const timestamp = Date.now();
			setSelectedRowId({ id: record?.id, timestamp });
		}
	};

	// Save
	const onSave = () => {
		submit(
			{
				renderFields,
				renderItems,
				contentDetail,
				items: itemsForUpdate,
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
			} as any,
			{
				method: "POST",
				action: `${routes.content}/${contentDetail.id}${location.search}`,
				encType: "application/json",
			},
		);
		setIsSaving(true);
	};

	// Handle response
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (!actionData) return;

		if (actionData?.actionType === ACTION_TYPES_CONTENT.SAVE) {
			if (actionData.status === false) {
				notification.error({
					message: jp.message.content.saveWithErrors,
					description: actionData.error,
					placement: "topRight",
				});
			} else {
				notification.success({
					message: jp.message.common.saveSuccessful,
					placement: "topRight",
				});
			}
			setIsSaving(false);
		} else if (contentId && setContentItems) {
			if (actionData.status === false) {
				notification.error({
					message: jp.message.common.failed,
					description: actionData.error,
					placement: "topRight",
				});
				return;
			}
			notification.success({
				message: jp.message.common.successful,
				placement: "topRight",
			});
			switch (actionData?.actionType) {
				case ACTION_TYPES_CONTENT.PUBLISH:
				case ACTION_TYPES_CONTENT.PUBLISH_VISUALIZE:
				case ACTION_TYPES_CONTENT.CREATE_CHAT:
				case ACTION_TYPES_CONTENT.CREATE_ASSET:
				case ACTION_TYPES_CONTENT.CREATE_ASSET_VISUALIZE: {
					const updatedContentItems = contentItems?.map(
						(item: ContentItem, index: number) => {
							if (index !== 0) return item;

							const { publicStatus, ...restManagement } = item.management || {};
							const { publicStatus: publicStatusVisualize, ...restVisualize } =
								item.visualize || {};
							const { status, ...restChat } = item.chat || {};

							const data = (
								actionData as unknown as SuccessResponse<ContentItem>
							).data;
							return {
								...item,
								schema: data?.schema
									? { ...item.schema, ...data.schema }
									: item.schema,
								management: data?.management
									? { ...restManagement, ...data.management }
									: restManagement,
								chat: data?.chat ? { ...restChat, ...data.chat } : restChat,
								visualize: data?.visualize
									? { ...restVisualize, ...data.visualize }
									: restVisualize,
								duplicateContent: data?.duplicateContent
									? { ...item.duplicateContent, ...data.duplicateContent }
									: item.duplicateContent,
							};
						},
					);

					if (updatedContentItems) {
						setContentItems(updatedContentItems as DataTableContentType[]);
					}
					break;
				}
				default: {
					setContentItems([]);
				}
			}
		}
	}, [actionData]);

	return (
		<ContentItemTable>
			{isSaving && (
				<div className="loading-save">
					<Spin indicator={<Icon icon="loading" />} size="large" />
				</div>
			)}

			<div className={`content-viewer-table ${contentId ? "h-80" : "h-90"}`}>
				<Table
					bordered
					tableLayout="fixed"
					scroll={{ x: 1000, y: contentId ? 280 : 1000 }}
					dataSource={renderItems}
					loading={isLoadItem}
					columns={getColumns({
						fields: renderFields,
						onItemChange,
						onFieldChange,
						onDeleteRow,
					})}
					pagination={false}
					onRow={(record) => ({
						onClick: () => handleRowClick(record),
					})}
				/>
			</div>

			<div className="wrap-pagination">
				<Pagination
					showQuickJumper
					showSizeChanger
					showTotal={(total: number) => jp.common.totalItems(total)}
					current={externalFilter?.page || filters.page}
					total={totalPage}
					onChange={(page, pageSize) => {
						handleFilterChange(page, pageSize || filters.perPage);
					}}
					onShowSizeChange={(current, size) => {
						handleFilterChange(DefaultCurrent, size);
					}}
					pageSizeOptions={PageSizeOptions}
					pageSize={externalFilter?.perPage || filters.perPage}
					className="content-viewer-pagination"
					responsive={true}
					locale={{
						jump_to: jp.common.goTo,
						page: jp.common.page,
						items_per_page: `/ ${jp.common.page}`,
					}}
				/>
			</div>

			{contentId && (
				<div className="button-bottom">
					<InsertRowModal
						onAddRow={onAddRow}
						isGeoJson={isGeoJson}
						baseContent={contentDetail}
					/>
					<InsertColumnModal onAddColumn={onAddColumn} fields={renderFields} />
					<Button
						disabled={isSaving}
						type="primary"
						icon={<Icon icon="save" size={16} />}
						onClick={onSave}
					>
						{jp.common.save}
					</Button>
				</div>
			)}
		</ContentItemTable>
	);
};

// Get className for cell
function getCellMode(
	fieldValue: TableItemField,
	field: RenderContentField,
): CELL_MODE {
	if (field.mode === CELL_MODE.DELETED) {
		return CELL_MODE.DELETED;
	}
	if (!fieldValue) {
		return CELL_MODE.NO_DATA;
	}
	if (fieldValue.mode === CELL_MODE.DELETED) {
		return CELL_MODE.DELETED;
	}
	if (
		fieldValue.mode === CELL_MODE.EDITED ||
		fieldValue.mode === CELL_MODE.NEW
	) {
		return CELL_MODE.EDITED;
	}
	return CELL_MODE.DEFAULT;
}

// Handle cell
const CellWrapper: RenderCellComponent = (props) => {
	const { fieldValue, field } = props;
	const mode = getCellMode(fieldValue, field);
	return (
		<CellWrapperStyled mode={mode}>
			<TableCell {...props} />
		</CellWrapperStyled>
	);
};

// Format value
function formatValue(
	fieldType: FIELD_TYPE | string | undefined,
	value: string | null | boolean,
): FieldPossibleValue {
	if (_.isNil(value)) {
		return null;
	}
	switch (fieldType) {
		case FIELD_TYPE.Bool:
			return value;
		case FIELD_TYPE.Multiple:
		case FIELD_TYPE.Select:
			return String(value)?.split?.(",") ?? [];
		case FIELD_TYPE.Integer:
		case FIELD_TYPE.Number:
			return !Number.isNaN(Number(value)) ? Number.parseInt(String(value)) : 0;
		case FIELD_TYPE.GeometryObject:
			return null;
		case FIELD_TYPE.DateTime:
		case FIELD_TYPE.Date:
			return String(new Date(String(value))) === "Invalid Date"
				? null
				: formatDate(String(value));
		case FIELD_TYPE.Text:
		case FIELD_TYPE.TextArea:
			return value;
		default:
			return value;
	}
}
