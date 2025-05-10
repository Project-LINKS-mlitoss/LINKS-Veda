import { useActionData, useNavigate, useSearchParams } from "@remix-run/react";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import notification from "~/components/atoms/Notification";
import { updateMultipleSearchParams } from "~/components/molecules/Common/utils";
import ModalDeleteTemplate from "~/components/pages/Templates/Modal/ModalDeleteTemplate";
import { Temps } from "~/components/pages/Templates/TemplatesList/Temps";
import { TemplatesListS } from "~/components/pages/Templates/styles";
import type { ContentResponse } from "~/models/content";
import {
	ACTION_TYPES_TEMPLATE,
	OPERATOR_TYPE,
	type TemplatesResponse,
	type TemplatesT,
	type WorkflowT,
	operatorTypeToUrlMap,
} from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import { theme } from "~/styles/theme";

type Props = {
	templates: TemplatesResponse;
	workflows: WorkflowT[];
	setTempChoose: (val: TemplatesT | WorkflowT | undefined) => void;
	tempChoose: TemplatesT | WorkflowT | undefined;
};

const TemplatesList: React.FC<Props> = (props) => {
	// Props
	const { templates, workflows, setTempChoose, tempChoose } = props;

	// Remix
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const actionData = useActionData<ApiResponse<null>>();
	const updateParams = (params: Record<string, string | null>) => {
		updateMultipleSearchParams(searchParams, setSearchParams, params);
	};

	// State
	const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
	const [selectedType, setSelectedType] = useState<OPERATOR_TYPE | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Filter
	const [filters, setFilters] = useState({
		keyword: searchParams.get("keyword") || "",
	});
	const handleFilterChange = (updates: Partial<typeof filters>) => {
		const newFilters = { ...filters, ...updates };
		setFilters(newFilters);

		updateParams({
			keyword: newFilters.keyword || null,
		});
	};

	useEffect(() => {
		setFilters({
			keyword: searchParams.get("keyword") || "",
		});
	}, [searchParams]);

	// Init data
	const templateTypes = [
		{
			type: OPERATOR_TYPE.WORK_FLOW,
			title: "ワークフロー",
			icon: "templateBox",
		},
		{
			type: OPERATOR_TYPE.DATA_STRUCTURE,
			title: "構造化",
			icon: "strucOrigin",
		},
		{
			type: OPERATOR_TYPE.PRE_PROCESSING,
			title: "結合前処理",
			icon: "preBindingProcessing",
		},
		{
			type: OPERATOR_TYPE.TEXT_MATCHING,
			title: "テキストマッチング",
			icon: "textMatching",
		},
		{ type: OPERATOR_TYPE.CROSS_TAB, title: "クロス集計", icon: "crosstab" },
		{
			type: OPERATOR_TYPE.SPATIAL_JOIN,
			title: "空間結合",
			icon: "spatialJoinProcessing",
		},
		{
			type: OPERATOR_TYPE.SPATIAL_AGGREGATE,
			title: "空間集計",
			icon: "spatialAggregationProcessing",
		},
	];
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const listTemplate = useMemo(
		() =>
			templateTypes.map((temp) => {
				if (temp?.type === OPERATOR_TYPE.WORK_FLOW) {
					return {
						...temp,
						temps: workflows.map((workflow) => ({
							...workflow,
							id: OPERATOR_TYPE.WORK_FLOW + workflow?.id,
						})),
					};
				}
				return {
					...temp,
					temps: templates?.filter(
						(template) => template?.operatorType === temp?.type,
					),
				};
			}),
		[workflows, templates],
	);

	const filteredTemplates = useMemo(() => {
		if (selectedType) {
			return listTemplate.filter((temp) => temp.type === selectedType);
		}
		return listTemplate;
	}, [listTemplate, selectedType]);

	// Handle response
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (actionData && actionData?.actionType === ACTION_TYPES_TEMPLATE.DELETE) {
			const data = actionData as ApiResponse<ContentResponse | null>;
			if (data.status === false) {
				notification.error({
					message: jp.message.common.failed,
					description: data.error,
					placement: "topRight",
				});
			} else {
				notification.success({
					message: jp.message.common.successful,
					placement: "topRight",
				});
			}
			setIsModalDeleteOpen(false);
			setIsDeleting(false);
			setTempChoose(undefined);
		}
	}, [actionData]);

	const handleNavigate = (type: string) => {
		const tempChooseTemplatesT = tempChoose as TemplatesT;

		if (
			tempChooseTemplatesT?.operatorType &&
			tempChooseTemplatesT?.operatorType !== OPERATOR_TYPE.WORK_FLOW
		) {
			navigate(
				`${
					operatorTypeToUrlMap[
						tempChooseTemplatesT?.operatorType as OPERATOR_TYPE
					]
				}?templateId=${tempChoose?.id}`,
			);
		} else {
			const workflowId = String(tempChooseTemplatesT?.id).replace(
				OPERATOR_TYPE.WORK_FLOW,
				"",
			);
			if (type === "edit") navigate(`workflow/${workflowId}`);
			else {
				const tempChooseWorkflowT = tempChoose as WorkflowT;
				navigate(
					`${
						operatorTypeToUrlMap[
							tempChooseWorkflowT?.workflowDetails?.[0]
								?.operatorType as OPERATOR_TYPE
						]
					}?workflowId=${workflowId}`,
				);
			}
		}
	};

	return (
		<TemplatesListS>
			<div className="filter-list">
				<div className="filter">
					<Input
						placeholder={`${jp.common.search}${jp.common.template}`}
						value={filters.keyword}
						onChange={(e) =>
							setFilters((prev) => ({
								...prev,
								keyword: e.target.value,
							}))
						}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleFilterChange({ keyword: filters.keyword });
							}
						}}
						className="input-search"
					/>
					<button
						type="button"
						onClick={() => handleFilterChange({ keyword: filters.keyword })}
						className="button-search"
					>
						<Icon icon="search" color={theme.colors.lightGray} />
					</button>
				</div>

				<div className="wrap-list" key={filteredTemplates.length}>
					{filteredTemplates?.map((temp) => {
						return (
							<div className="list" key={`${temp?.type}`}>
								<Temps
									key={temp?.temps?.length}
									tempList={temp}
									setTempChoose={setTempChoose}
									tempChoose={tempChoose}
									selectedType={selectedType}
									setSelectedType={setSelectedType}
								/>
							</div>
						);
					})}
				</div>
			</div>

			<div className="button-bottom">
				<Button
					type="primary"
					danger
					ghost
					onClick={() => setIsModalDeleteOpen(true)}
					icon={<Icon icon="trash" size={16} />}
					className="button-delete"
					disabled={!tempChoose}
				>
					{jp.common.template}
					{jp.common.delete}
				</Button>
				<Button
					icon={<Icon icon="edit" size={16} />}
					onClick={() => handleNavigate("edit")}
					type="primary"
					disabled={!tempChoose}
				>
					{jp.common.template}
					{jp.common.edit}
				</Button>
				<Button
					icon={<Icon icon="playCircleOutlined" size={16} />}
					onClick={() => handleNavigate("use")}
					type="primary"
					disabled={!tempChoose}
				>
					{jp.operator.useTemplate}
				</Button>
			</div>

			<ModalDeleteTemplate
				isModalDeleteOpen={isModalDeleteOpen}
				setIsModalDeleteOpen={setIsModalDeleteOpen}
				tempChoose={tempChoose}
				isDeleting={isDeleting}
				setIsDeleting={setIsDeleting}
			/>
		</TemplatesListS>
	);
};

export default TemplatesList;
