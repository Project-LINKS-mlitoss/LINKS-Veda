import styled from "@emotion/styled";
import { type FocusEvent, useCallback, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import TextArea, { type TextAreaProps } from "app/components/atoms/TextArea";

type Props = {
	value?: string;
	onChange?: (value: string) => void;
} & TextAreaProps;

const MarkdownInput: React.FC<Props> = ({ value = "", onChange, ...props }) => {
	const [showMD, setShowMD] = useState(true);
	const textareaRef = useRef<HTMLInputElement>(null);

	const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement>) => {
		event.stopPropagation();
		setShowMD(true);
	}, []);

	const handleClick = useCallback(() => {
		if (props.disabled) return;
		setShowMD(false);
		if (textareaRef.current) {
			setTimeout(() => {
				textareaRef.current?.focus();
			});
		}
	}, [props.disabled]);

	return (
		<MarkdownWrapper>
			<TextArea
				{...props}
				onChange={(e) => onChange?.(e)}
				onBlur={handleBlur}
				value={value}
				rows={6}
				hidden={showMD}
				ref={textareaRef}
				showCount
			/>
			<StyledMD
				disabled={props.disabled}
				hidden={!showMD}
				onClick={handleClick}
			>
				<ReactMarkdown>{value}</ReactMarkdown>
			</StyledMD>
		</MarkdownWrapper>
	);
};

export default MarkdownInput;

const MarkdownWrapper = styled.div`
  width: 100%;
`;

const StyledMD = styled.div<{ disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  border: 1px solid #d9d9d9;
  padding: 4px 11px;
  overflow: auto;
  resize: vertical;
  height: 100%;
  width: 100% !important;
  height: 142px;
  line-height: 1;
  word-break: break-all;
  &:hover,
  &:focus {
    border-color: ${({ disabled }) => (disabled ? "inherited" : "#40a9ff")};
  }
  background-color: ${({ disabled }) => (disabled ? "#f5f5f5" : "#FFF")};
  * {
    color: ${({ disabled }) => (disabled ? "rgba(0, 0, 0, 0.25)" : "#000")};
  }
`;
