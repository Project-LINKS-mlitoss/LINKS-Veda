import { useNavigate } from "@remix-run/react";
import type * as React from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Card from "~/components/atoms/Card";
import Icon from "~/components/atoms/Icon";
import { OperatorCardS } from "./styles";

interface Props {
	title: string;
	description: string;
	input: string;
	output: string;
	icon: string;
	to: string;
}

const OperatorCard: React.FC<Props> = (props) => {
	const { title, description, input, output, icon, to } = props;
	const navigate = useNavigate();

	return (
		<OperatorCardS>
			<Card
				key={title}
				className="card-item"
				bordered={false}
				onClick={() => {
					navigate(to);
				}}
				hoverable
			>
				<div className="card-title">
					<Icon icon={icon} /> {title}
				</div>
				<p className="card-description">{description}</p>
				<div className="card-buttons">
					<div className="card-button-item">
						<Button>{jp.operator.input}</Button>
						<span>{input}</span>
					</div>
					<div className="card-button-item">
						<Button>{jp.operator.output}</Button>
						<span>{output}</span>
					</div>
				</div>
			</Card>
		</OperatorCardS>
	);
};

export default OperatorCard;
