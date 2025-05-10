import Header from "./Header";
import { LayoutS } from "./styles";

export default function LayoutMolecule({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<LayoutS>
			<Header />

			<div className="wrap-children">{children}</div>
		</LayoutS>
	);
}
