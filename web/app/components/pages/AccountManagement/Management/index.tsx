import { useSubmit } from "@remix-run/react";
import type { SelectProps } from "antd";
import _ from "lodash";
import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROLE } from "~/commons/core.const";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Icons from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Select from "~/components/atoms/Select";
import Switch from "~/components/atoms/Switch";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import { ManagementS } from "~/components/pages/AccountManagement/styles";
import type { DataTableAccountsType } from "~/components/pages/AccountManagement/types";
import type { AccountManagementI } from "~/models/accountManagementModel";
import type { UseCaseResponse } from "~/models/useCaseModel";
import { ACTION_TYPES_USER } from "~/models/userModel";

export function Management({
	currentUser,
	isPreview,
	useCases,
	userDetail,
	setUserItems,
}: {
	isPreview: boolean;
	useCases: UseCaseResponse;
	currentUser: AccountManagementI;
	userDetail: DataTableAccountsType;
	setUserItems: (
		val: (prevItems: DataTableAccountsType[]) => DataTableAccountsType[],
	) => void;
}) {
	const submit = useSubmit();
	const [isSelectUcOpen, setIsSelectUcOpen] = useState(false);
	const [ucIds, setUcIds] = useState<number[]>([]);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const isEditAble = currentUser && currentUser.role === ROLE.ADMIN;
	const options: SelectProps["options"] = useCases.status
		? useCases.data.map((useCase) => ({
				value: useCase.id,
				label: useCase.name,
			}))
		: [];

	const handleOutsideClick = useCallback((event: MouseEvent) => {
		if (
			containerRef.current &&
			!containerRef.current.contains(event.target as Node)
		) {
			setIsSelectUcOpen(false);
		}
	}, []);

	useEffect(() => {
		document.addEventListener("mousedown", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [handleOutsideClick]);

	useEffect(() => {
		addUC(isSelectUcOpen);
	}, [isSelectUcOpen]);

	useEffect(() => {
		setUcIds(userDetail?.useCaseIds ?? []);
	}, [userDetail]);

	const handleSwitchPermission = () => {
		if (!isEditAble) return;

		const role = userDetail?.role === ROLE.ADMIN ? ROLE.VIEW : ROLE.ADMIN;
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_USER.SWITCH_ROLE);
		formData.append("role", role.toString());
		formData.append("userId", userDetail.uid);

		submit(formData, { method: "post" });
		setUserItems((prevItems): DataTableAccountsType[] => {
			const updatedItems = [...prevItems];
			updatedItems[0] = {
				...userDetail,
				role: role,
			};

			return updatedItems;
		});
	};

	const addUC = (open: boolean) => {
		if (
			!open &&
			userDetail &&
			!_.isEqual(userDetail?.useCaseIds ?? [], ucIds) &&
			isEditAble
		) {
			const formData = new FormData();
			formData.append("_action", ACTION_TYPES_USER.ADD_UC);
			formData.append("uid", userDetail?.uid);
			formData.append("ucIds", JSON.stringify(ucIds));

			submit(formData, { method: "post" });
			setUserItems((prevItems): DataTableAccountsType[] => {
				const updatedItems = [...prevItems];
				updatedItems[0] = {
					...userDetail,
					useCaseIds: ucIds,
				};

				return updatedItems;
			});
		}
	};

	const handleToggleSelectUC = () => {
		setIsSelectUcOpen(!isSelectUcOpen);
	};

	const handleChange = (values: number[]) => {
		if (!isEditAble) return;

		setUcIds(values);
	};

	const handleRemoveUC = (value: number) => {
		if (!isEditAble) return;

		const ucIds = (userDetail.useCaseIds ?? []).filter((uc) => uc !== value);
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_USER.ADD_UC);
		formData.append("uid", userDetail?.uid);
		formData.append("ucIds", JSON.stringify(ucIds));

		submit(formData, { method: "post" });
		setUserItems((prevItems): DataTableAccountsType[] => {
			const updatedItems = [...prevItems];
			updatedItems[0] = {
				...userDetail,
				useCaseIds: ucIds,
			};

			return updatedItems;
		});
	};

	const getDefaultUCOption = (uc: number) => {
		if (!options) return "";
		const option = options.find((opt) => opt.value === uc);

		return option ? option.label : "";
	};

	if (!isPreview) return null;

	return (
		<WrapViewer title="Management" icon={<Icon icon="management" size={16} />}>
			<ManagementS>
				<div className="management-item">
					<p className="management-item-title">
						管理者権限
						<Switch
							disabled={
								!isEditAble ||
								(currentUser && currentUser.userId === userDetail?.uid)
							}
							checked={userDetail?.role === ROLE.ADMIN}
							onChange={handleSwitchPermission}
						/>
					</p>
					<div className="management-item mt-[25px]">
						<p className="management-item-title">ユースケース権限</p>

						<div className="emails">
							{(userDetail.useCaseIds ?? []).map((uc) => (
								<div className="email-item" key={uc}>
									<Input
										defaultValue={getDefaultUCOption(uc) as string}
										readOnly
									/>
									<Button
										type="text"
										icon={<Icon icon="close" />}
										onClick={() => handleRemoveUC(uc)}
										style={{ marginLeft: 8 }}
									/>
								</div>
							))}
						</div>

						<div
							className="uc-wrapper"
							ref={containerRef}
							id="add-uc-wrapper"
							style={{ position: "relative", width: "100%" }}
						>
							<Select
								mode="multiple"
								className="uc-select"
								placeholder="Tags Mode"
								options={options}
								open={isSelectUcOpen}
								getPopupContainer={() =>
									document.getElementById("add-uc-wrapper") || document.body
								}
								onChange={handleChange}
								value={ucIds}
							/>

							<Button
								icon={<Icons icon="plus" />}
								onClick={handleToggleSelectUC}
								className="button-add-uc"
								type="text"
							>
								ユースケースを追加
							</Button>
						</div>
					</div>
				</div>

				<div className="management-item update">
					<p className="management-item-title">Created at</p>
					<p className="update-info">4/12/2022 11:55</p>
				</div>
			</ManagementS>
		</WrapViewer>
	);
}
