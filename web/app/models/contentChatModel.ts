import type { CHAT_STATUS } from "~/commons/core.const";
import type { ContentDetails } from "./content";

export interface ContentChatI {
	id?: number;
	chatId?: string;
	status?: CHAT_STATUS;
	contentId?: string;
	contentName?: string;
	schema?: ContentDetails;
	userId?: string;
	username?: string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string;
}

export interface ChatResponse {
	models: ContentChatI[];
	page: number;
	perPage: number;
	totalCount: number;
}

export interface ChatDetailResponse {
	answer: string;
}

export interface ChatParams {
	page: number;
	perPage: number;
	sort?: string;
	dir?: string;
	keyword: string;
}

export class Chat {
	id?: number;
	chatId?: string;
	status?: CHAT_STATUS;
	contentId?: string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string;

	constructor(props: ContentChatI) {
		this.id = props.id;
		this.chatId = props.chatId;
		this.status = props.status;
		this.contentId = props.contentId;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
		this.deletedAt = props.deletedAt;
	}
}

export enum ACTION_TYPES_CONTENT_CHAT {
	SEND_MESSAGE = "send_message",
}
