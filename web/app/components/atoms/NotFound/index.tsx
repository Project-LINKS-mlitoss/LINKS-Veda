import styled from "@emotion/styled";

import Button from "app/components/atoms/Button";

const NotFound: React.FC = () => {
	return (
		<Wrapper>
			<CircleWrapper>
				<Circle>404</Circle>
			</CircleWrapper>
			<Content>
				<StyledTitle>Oops!</StyledTitle>
				<StyledText>ページが見つかりません。</StyledText>
				<Button href="/" type="primary">
					ホームへ戻る
				</Button>
			</Content>
		</Wrapper>
	);
};

export default NotFound;

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
`;

const CircleWrapper = styled.div`
  padding: 32px;
`;

const Circle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96px;
  color: #bfbfbf;
  font-weight: 700;
  background-color: #d9d9d9;
  width: 240px;
  height: 240px;
  padding: 0;
  border-radius: 50%;
`;

const Content = styled.div`
  padding: 32px;
  text-align: center;
`;

const StyledTitle = styled.h1`
  text-align: center;
  color: #1890ff;
  font-weight: 500;
  font-size: 38px;
  line-height: 46px;
  margin-bottom: 24px;
`;

const StyledText = styled.p`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #00000073;
  margin-bottom: 24px;
`;
