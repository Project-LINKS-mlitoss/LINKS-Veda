import { Form, type FormInstance } from "antd";
import type { Rule } from "antd/lib/form";
import type { FormItemProps } from "antd/lib/form/FormItem";
import type { FormItemLabelProps } from "antd/lib/form/FormItemLabel";
import type {
	FieldError,
	ValidateErrorEntity,
} from "rc-field-form/lib/interface";

export default Form;

export type {
	FormItemProps,
	FormItemLabelProps,
	FieldError,
	FormInstance,
	Rule,
	ValidateErrorEntity,
};
