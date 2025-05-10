import Skeleton from "~/components/atoms/Skeleton";
import { SkeletonContentS } from "./styles";

export default function SkeletonContent() {
	return (
		<SkeletonContentS>
			<Skeleton active paragraph={{ rows: 5 }} />
		</SkeletonContentS>
	);
}
