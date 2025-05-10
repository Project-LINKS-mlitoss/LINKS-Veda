import styled from "@emotion/styled";

export const Contain = styled.div`
  width: 90%;
  max-width: 100%;
  margin: 10px;
  background: #fff;
  border-radius: 8px;
  `;

export const Typo = styled.p`
font-size: 12px;
margin: 4px 0;
`;
export const ResultContainer = styled.div`
display:flex;
flex-direction:column;
`;
export const TopContainer = styled.div`
  display: flex;
  margin-top: 10px;
  gap: 0px  10px; 
`;

interface LineProps {
	bool: boolean;
}

export const Line = styled.hr<LineProps>`
  height: 1px;
  border-width: 0;
  margin: ${({ bool }) => (bool ? "0" : " 15px")};
  background-color:#ECECEC;
`;

export const BarupContainer = styled.div`
display: flex;
flex=-wrap:nowrap;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
 `;

export const Link = styled.a`
  margin: 0px 3px;
  font-size: 11px;
  color: gray; 
  &:hover, &.active {
    text-decoration: underline;  
    color:blue;
  }
`;

export const BarContainer = styled.div`
  padding: 20px;
  margin: 15px auto;
  background: #fff;
  border: 1px solid #ECECEC;
  border-radius: 6px;
  width: 100%; // Make sure it takes full width
  height: 400px; // Set a fixed height
`;

export const KeyValueContainer = styled.div`
    display : flex;
    flex-direction : column;
    gap : 1rem;
    margin-bottom : 2rem
`;

export const KeyValueRow = styled.div`
    display: flex;
    justify-content : space-between;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;
