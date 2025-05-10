import styled from "@emotion/styled";
import Icon from "~/components/atoms/Icon/index.js";

export const ControlBarWrapper = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  align-items: start;
  gap: 0.5rem;
`;

export const IconButton = styled.button<{ isDarkMode: boolean }>`
  &:hover {
    background-color: ${({ isDarkMode }) =>
			isDarkMode ? "rgba(229, 231, 235, 0.2)" : "rgba(31, 41, 55, 0.2)"};
  }
  border-radius: 9999px;
  transition: colors 0.2s;
`;

export const IconWrapper = styled(Icon)<{
	isActive?: boolean;
	isDarkMode: boolean;
}>`
  width: 2rem;
  height: 2rem;
  color: ${({ isActive, isDarkMode }) => {
		if (isDarkMode) {
			return isActive ? "#ffffff" : "rgba(255, 255, 255, 0.7)";
		}
		return isActive ? "#1f2937" : "#6b7280";
	}};
  cursor: pointer;
`;

export const RelativeContainer = styled.div`
  position: relative;
`;

export const MiniboxContainer = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  top: 40px;
  right: 0;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#434343" : "#ffffff")};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
  width: 13rem;
`;

export const MiniboxHeader = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 0px;
  font-weight: 600;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#595959" : "#ffffff")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#9CA3AF" : "#374151")};
  padding: 12px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

export const MiniboxContent = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  background: ${({ isDarkMode }) => (isDarkMode ? "#434343" : "#ffffff")};
  padding: 12px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
`;

export const SpacedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StyledText = styled.span<{ isDarkMode: boolean }>`
  color: ${({ isDarkMode }) => (isDarkMode ? "#ffffff" : "#1f2937")};
`;

export const ZoneOptionContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-top: 0.2rem;
`;

export const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  cursor: pointer;
`;

export const RoundCheckbox = styled.input<{ isDarkMode: boolean }>`
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
  cursor: pointer;
  appearance: none;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#D9D9D9" : "#1f2937")};
  border-radius: 50%;
  background-color: transparent;
  transition: background-color 0.2s, border-color 0.2s;
  position: relative;

  &:checked {
    border-color: #1677ff;
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      background-color: #1677ff;
      border-radius: 50%;
    }
  }

  &:focus {
    outline: none;
  }
`;

export const ZoneLabel = styled.label<{ isDarkMode: boolean }>`
  color: ${({ isDarkMode }) => (isDarkMode ? "#ffffff" : "#1f2937")};
  cursor: pointer;
`;

export const SectionTitle = styled.div<{ isDarkMode: boolean }>`
  color: ${({ isDarkMode }) => (isDarkMode ? "#ffffff" : "#1f2937")};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

export const SubSectionTitle = styled(SectionTitle)`
  margin-top: 1rem;
  font-weight: 500;
`;

export const Gap = styled.div`
  height: 0.5rem;
`;

export const ContainerInside = styled.div`
  padding-left: 1.5rem;
`;

export const SquareboxContainer = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  top: 40px;
  right: 0;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#434343" : "#ffffff")};
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
  width: 288px;
`;

export const SquareboxHeader = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 0px;
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? "#9CA3AF" : "#374151")};
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  font-size: 12px;
  font-weight: normal;
`;

export const SquareboxContent = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  background: ${({ isDarkMode }) => (isDarkMode ? "#434343" : "#ffffff")};
  width: 261px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
`;

export const SpacedSquareContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 20px;
`;
