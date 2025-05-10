import { Form, useActionData, useSubmit } from "@remix-run/react";
import Markdown from "markdown-to-jsx";
import * as React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Icons from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import notification from "~/components/atoms/Notification";
import WrapContent from "~/components/molecules/Common/WrapContent";
import { ChatMessageS, ChatS } from "~/components/pages/Chat/styles";
import {
	ACTION_TYPES_CONTENT_CHAT,
	type ChatDetailResponse,
	type ContentChatI,
} from "~/models/contentChatModel";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

const { TextArea } = Input;

enum CHAT_ANSWER_STATUS {
	WAITING = "waiting",
	ANSWERED = "answered",
}

enum CHAT_SENDER {
	BOT = "bot",
	USER = "user",
}
type ChatProps = {
	data: ContentChatI[];
};

type Message = {
	id?: number;
	type: CHAT_SENDER;
	status?: CHAT_ANSWER_STATUS;
	text: string;
};

const ChatPageDetail: React.FC<ChatProps> = ({ data }: ChatProps) => {
	const actionData = useActionData<ApiResponse<ChatDetailResponse>>();
	const submit = useSubmit();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState<string>("");

	const handleSendMessage = () => {
		setIsLoading(true);
		setMessages((prev) => [
			...prev,
			{
				type: CHAT_SENDER.USER,
				text: inputValue,
			},
			{
				status: CHAT_ANSWER_STATUS.WAITING,
				type: CHAT_SENDER.BOT,
				text: "",
			},
		]);
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_CONTENT_CHAT.SEND_MESSAGE);
		formData.append("targetIds", data.map((item) => item.contentId).join(","));
		formData.append("message", inputValue);

		submit(formData, { method: "post" });
		setInputValue("");
	};

	useEffect(() => {
		if (actionData) {
			setIsLoading(false);
			if (actionData.status === false) {
				notification.error({
					message: jp.message.common.failed,
					description: actionData.error,
					placement: "topRight",
				});
			} else {
				setMessages((prev) =>
					prev.map((msg) =>
						msg?.status === CHAT_ANSWER_STATUS.WAITING
							? {
									...msg,
									text: actionData.data?.answer,
									status: CHAT_ANSWER_STATUS.ANSWERED,
								}
							: msg,
					),
				);
				notification.success({
					message: jp.message.common.successful,
					placement: "topRight",
				});
			}
		}
	}, [actionData]);

	return (
		<ChatS>
			<WrapContent
				breadcrumbItems={[
					{
						href: routes.chat,
						title: (
							<>
								<Icon icon="chat" size={24} color={theme.colors.semiBlack} />
								<span>チャット</span>
							</>
						),
					},
				]}
			>
				<ChatMessageS>
					<div className="file-name">
						<span className="file-label">{jp.asset.fileNameContent}</span>
						<span className="file-name-content">
							{data.length
								? data.map((item) => item.contentName).join(", ")
								: "N/A"}
						</span>
					</div>
					<div className="body">
						{messages.length > 0 &&
							messages.map((message, index) => (
								<React.Fragment key={`${index}-${message.text}`}>
									{message.type === CHAT_SENDER.BOT &&
									message?.status === CHAT_ANSWER_STATUS.WAITING ? (
										<div className={`${message.type} typing`}>
											<div className="dot" />
											<div className="dot" />
											<div className="dot" />
										</div>
									) : (
										<Markdown className={`${message.type} markdown-content`}>
											{message.text}
										</Markdown>
									)}
								</React.Fragment>
							))}
					</div>
					<div className="send">
						<Form method="POST" className="form">
							<TextArea
								rows={3}
								name="message"
								onKeyDown={(e) => {
									if (e.ctrlKey && e.key === "Enter") {
										handleSendMessage();
									}
								}}
								value={inputValue}
								placeholder="自由文"
								onChange={(e) => setInputValue(e.target.value)}
							/>
							<Input name="category" type="hidden" value="string" />
							<div className="button-submit">
								<Button
									htmlType="submit"
									type="default"
									name="_action"
									value="send_message"
									key="send_message"
									onClick={handleSendMessage}
									disabled={inputValue === "" || isLoading}
								>
									<Icons icon="enterO" size={14} />
									Enter
								</Button>
							</div>
						</Form>
					</div>
				</ChatMessageS>
			</WrapContent>
		</ChatS>
	);
};

export default ChatPageDetail;
