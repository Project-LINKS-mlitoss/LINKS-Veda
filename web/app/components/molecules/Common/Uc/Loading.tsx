import styled from "@emotion/styled";
import { Progress } from "antd";

const PreRequestLoadingContainer = styled.div`
  margin-top: 70px;
  .rotate-path {
    margin: auto;
    text-align: center;
  }
  .rotate-path .ant-progress-circle-path {
    animation: rotate-path 2s linear infinite;
    transform-origin: center;
  }
  @keyframes rotate-path {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .process {
    margin-bottom: 70px;
  }`;

const Loading = () => {
	return (
		<PreRequestLoadingContainer
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100&",
			}}
		>
			<div className="rotate-path">
				<Progress
					type="circle"
					percent={75}
					format={() => null}
					className="process"
				/>
			</div>
		</PreRequestLoadingContainer>
	);
};

export default Loading;
