import { theme } from "~/styles/theme";
import {
	Actions,
	Divider,
	FiltersContainer,
	Group,
	Label,
	LinkText,
	Scrollable,
	Section,
} from "./style";
import type { FieldType, FiltersProps } from "./type";

import Button from "app/components/atoms/Button";
import Form from "app/components/atoms/Form";
import Input from "app/components/atoms/Input";
import Select from "app/components/atoms/Select";
import React from "react";
import Icon from "~/components/atoms/Icon";
import type { ChartsFormType } from "../ChartsViewer/types";
import type { ChartType } from "../types";

const Filters: React.FC<FiltersProps> = ({
	fields,
	initialValues,
	isEditing,
	onSubmit,
	onOverwrite,
	onDelete,
}) => {
	const [form] = Form.useForm<ChartsFormType>();
	const [selectedChartType, setSelectedChartType] = React.useState<ChartType>(
		initialValues?.type || "pie",
	);

	React.useEffect(() => {
		if (initialValues) {
			form.setFieldsValue(initialValues);
			setSelectedChartType(initialValues.type);
		} else {
			form.resetFields();
			setSelectedChartType("pie");
		}
	}, [form, initialValues]);

	const handleChartTypeChange = (type: ChartType) => {
		setSelectedChartType(type);
		form.setFieldValue("type", type);
	};

	const handleSubmit = (values: ChartsFormType) => {
		const formData = {
			...values,
			type: selectedChartType,
		};

		if (isEditing) {
			onOverwrite(formData);
		} else {
			onSubmit(formData);
		}
		form.resetFields();
		setSelectedChartType("pie");
	};

	return (
		<FiltersContainer>
			<Form
				form={form}
				onFinish={handleSubmit}
				initialValues={{
					type: "pie",
				}}
				layout="vertical"
			>
				<Scrollable>
					<div id="visualization-filters-top" />

					<Section>
						<Form.Item
							name="title"
							label="グラフタイトル"
							rules={[
								{ required: true, message: "タイトルを入力してください" },
							]}
						>
							<Input placeholder="タイトルを入力してください" />
						</Form.Item>
					</Section>

					<Section>
						<Label>グラフの種類</Label>
						<div className="w-full">
							<Button
								className="w-1/3"
								type={selectedChartType === "pie" ? "primary" : "default"}
								onClick={() => handleChartTypeChange("pie")}
							>
								円グラフ
							</Button>
							<Button
								className="w-1/3"
								type={selectedChartType === "bar" ? "primary" : "default"}
								onClick={() => handleChartTypeChange("bar")}
							>
								棒グラフ
							</Button>
							<Button
								className="w-1/3"
								type={selectedChartType === "line" ? "primary" : "default"}
								onClick={() => handleChartTypeChange("line")}
							>
								折れ線
							</Button>
						</div>
						<Form.Item name="type" hidden>
							<Input />
						</Form.Item>
					</Section>

					<Section>
						<Form.Item
							name="xAxis"
							label="Condition X"
							rules={[{ required: true }]}
						>
							<Select>
								{fields?.map((field: FieldType) => (
									<Select.Option key={field} value={field}>
										{field}
									</Select.Option>
								))}
							</Select>
						</Form.Item>
					</Section>

					{selectedChartType !== "pie" && (
						<Section>
							<Form.Item
								name="yAxis"
								label="Condition Y"
								rules={[{ required: true }]}
							>
								<Select mode="multiple">
									{fields?.map((field: FieldType) => (
										<Select.Option key={field} value={field}>
											{field}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
						</Section>
					)}

					{/* related options */}
					<Section>
						<Form.Item>
							<Label>集計対象</Label>
							<Select placeholder="事故種類" />
						</Form.Item>
					</Section>

					<Divider />

					<LinkText onClick={() => {}}>
						現在のマップのパラメーターを取得する
					</LinkText>

					<Section>
						<Label>対象期間の選択</Label>
						<Form.Item>
							<Select placeholder="2020-1-1" />
							<Select placeholder="以降" className="my-2" />
						</Form.Item>

						<div className="flex gap-2 justify-end">
							<LinkText onClick={() => {}}>リセット</LinkText>
							<LinkText onClick={() => {}}>全期間</LinkText>
						</div>
					</Section>

					<Divider />

					{/* TODO: Will integrate it with useOptimizedGeoData */}

					<Section>
						<Label>集計エリアの選択</Label>
						<Group>
							<Button className="active">行政区域</Button>
							<Button>各種区域</Button>
							<Button>範囲指定</Button>
						</Group>
						<Group>
							<Select placeholder="神奈川県" />
							<Select placeholder="藤沢市" />
						</Group>
						<Group>
							<Select placeholder="行政区域" />
						</Group>
						<LinkText onClick={() => {}}>リセット</LinkText>
					</Section>

					<Divider />

					<Section>
						<Label>集計条件の設定</Label>
						<Label>機器情報</Label>
						<Group>
							<Label>製造者</Label>
							<Input placeholder="選択してください" />
						</Group>
						<Group>
							<Label>型式名</Label>
							<Input placeholder="型式 A" />
						</Group>
						<Group>
							<Label>種類</Label>
							<Input placeholder="種類 A" />
						</Group>
						<Group>
							<Label>重量</Label>
							<Group>
								<Select placeholder="0g" />
								<Select placeholder="より重い" />
							</Group>
						</Group>
					</Section>

					<Divider />

					<div id="visualization-filters-bottom" />
				</Scrollable>

				<Actions>
					<Button.Group>
						<Button
							shape="circle"
							icon={<Icon icon="UpOutlined" />}
							href="#visualization-filters-top"
						/>
						<Button
							shape="circle"
							icon={<Icon icon="downOutlined" />}
							href="#visualization-filters-bottom"
						/>
					</Button.Group>

					{isEditing && (
						<Button danger onClick={onDelete}>
							削除
						</Button>
					)}

					{isEditing ? (
						<Button type="primary" htmlType="submit">
							上書き
						</Button>
					) : (
						<Button
							type="primary"
							htmlType="submit"
							style={{
								backgroundColor: theme.colors.vividBlue,
								color: theme.colors.white,
							}}
						>
							追加
						</Button>
					)}
				</Actions>
			</Form>
		</FiltersContainer>
	);
};

export default Filters;
