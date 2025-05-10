import styled from "@emotion/styled";
import Icon from "~/components/atoms/Icon";

import { useState } from "react";

interface AccidentFeature {
	properties: {
		番号: string;
		発生日時: string;
		発生場所: string;
		運航者: string;
		型式: string;
		製造者名_2: string;
		出発地: string;
		目的地: string;
		報告の概要: string;
		人の死傷状況: string;
	};
}

interface ParametersPanelProps {
	selectedAccident?: AccidentFeature;
	allAccidents?: AccidentFeature[];
	onAccidentSelect: (accident: AccidentFeature) => void;
}

const ITEMS_PER_PAGE = 10;

// Styled Components
const Container = styled.div<{ isMinimized: boolean }>`
  position: absolute;
  left: 12px;
  top: 12px;
  background: white;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  z-index: 1000;
  border-radius: 6px;
  width: 340px;
  transition: all 300ms;
  display: flex;
  flex-direction: column;
  height: ${(props) => (props.isMinimized ? "48px" : "calc(100% - 30px)")};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
`;

const PanelTitle = styled.h2`
  font-size: 1.125rem;
  line-height: 1.75rem;
`;

const IconWrapper = styled.span`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const PanelBody = styled.div`
  font-size: 0.875rem;
  background-color: rgb(243 244 246);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.div`
  padding: 16px;
  overflow-y: auto;
`;

export default function ParametersPanel({
	selectedAccident,
	allAccidents = [],
	onAccidentSelect,
}: ParametersPanelProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [isMinimized, setIsMinimized] = useState(false);

	const totalPages = Math.ceil(allAccidents.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const currentAccidents = allAccidents.slice(startIndex, endIndex);

	// Add this function to prevent map zoom
	const handleWheel = (e: React.WheelEvent) => {
		e.stopPropagation();
	};

	return (
		<Container isMinimized={isMinimized} onWheel={handleWheel}>
			<PanelHeader>
				<IconWrapper>
					<Icon icon="chevronBack" size={24} color="w-6 h-6 cursor-pointer" />
				</IconWrapper>
				<PanelTitle>事故細</PanelTitle>
				<IconWrapper onClick={() => setIsMinimized(!isMinimized)}>
					<Icon icon="minimize" size={24} color="w-6 h-6 cursor-pointer" />
				</IconWrapper>
			</PanelHeader>

			{!isMinimized && (
				<PanelBody>
					<ContentArea>
						{selectedAccident ? (
							<>
								{/* Selected Accident Details */}
								<div className="space-y-4 mb-6">
									<DetailGrid>
										<DetailLabel>No</DetailLabel>
										<DetailValue>
											{selectedAccident.properties.番号}
										</DetailValue>
									</DetailGrid>
									<DetailGrid>
										<DetailLabel>Date & Time</DetailLabel>
										<DetailValue>
											{new Date(
												selectedAccident.properties.発生日時,
											).toLocaleString("ja-JP")}
										</DetailValue>
									</DetailGrid>
									<DetailGrid>
										<DetailLabel>Place</DetailLabel>
										<DetailValue>
											{selectedAccident.properties.発生場所}
										</DetailValue>
									</DetailGrid>
									<DetailGrid>
										<DetailLabel>Operator</DetailLabel>
										<DetailValue>
											{selectedAccident.properties.運航者}
										</DetailValue>
									</DetailGrid>
									<DetailGrid>
										<DetailLabel>Model</DetailLabel>
										<DetailValue>
											{selectedAccident.properties.型式}
										</DetailValue>
									</DetailGrid>
									<DetailGrid>
										<DetailLabel>Manufacturer</DetailLabel>
										<DetailValue>
											{selectedAccident.properties.製造者名_2}
										</DetailValue>
									</DetailGrid>
									<DetailGrid>
										<DetailLabel>Departure</DetailLabel>
										<DetailValue>
											{selectedAccident.properties.出発地}
										</DetailValue>
									</DetailGrid>
									<DetailGrid>
										<DetailLabel>Arrival</DetailLabel>
										<DetailValue>
											{selectedAccident.properties.目的地}
										</DetailValue>
									</DetailGrid>
									<DetailGrid>
										<DetailLabel>Overview</DetailLabel>
										<DetailValue>
											{selectedAccident.properties.報告の概要}
										</DetailValue>
									</DetailGrid>
									<DetailGrid>
										<DetailLabel>Injuries</DetailLabel>
										<DetailValue>
											{selectedAccident.properties.人の死傷状況 || "None"}
										</DetailValue>
									</DetailGrid>
								</div>

								{/* Divider */}
								<Divider />

								{/* Table Headers */}
								<TableHeader>
									<TableGrid>
										<DetailLabel>No</DetailLabel>
										<DetailLabel>Date</DetailLabel>
										<DetailLabel>Place</DetailLabel>
									</TableGrid>
								</TableHeader>

								{/* Accidents List */}
								<AccidentsList>
									{currentAccidents.map((accident, index) => (
										<AccidentRow
											key={`accident-${accident.properties.番号}-${index}`}
											onClick={() => onAccidentSelect(accident)}
											className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 
                          ${selectedAccident.properties.番号 === accident.properties.番号 ? "bg-blue-50" : ""}`}
											isSelected={false}
										>
											<TableGrid>
												<DetailValue>#{accident.properties.番号}</DetailValue>
												<DetailValue>
													{new Date(
														accident.properties.発生日時,
													).toLocaleString("ja-JP", {
														year: "numeric",
														month: "2-digit",
														day: "2-digit",
													})}
												</DetailValue>
												<DetailValue>
													{accident.properties.発生場所}
												</DetailValue>
											</TableGrid>
										</AccidentRow>
									))}
								</AccidentsList>

								{/* Pagination */}
								<PaginationContainer>
									<PaginationButton
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={currentPage === 1}
										className="px-3 py-1 rounded bg-white shadow disabled:opacity-50"
									>
										Previous
									</PaginationButton>
									<span className="text-sm">
										Page {currentPage} of {totalPages}
									</span>
									<PaginationButton
										onClick={() =>
											setCurrentPage((p) => Math.min(totalPages, p + 1))
										}
										disabled={currentPage === totalPages}
										className="px-3 py-1 rounded bg-white shadow disabled:opacity-50"
									>
										Next
									</PaginationButton>
								</PaginationContainer>
							</>
						) : (
							<div className="space-y-4 mb-6 w-full">
								マーカーをクリックして事故詳細を表示
							</div>
						)}
					</ContentArea>
				</PanelBody>
			)}
		</Container>
	);
}

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
`;

const DetailLabel = styled.h3`
  font-size: 0.75rem;
`;

const DetailValue = styled.p`
  font-size: 0.875rem;
`;

const Divider = styled.hr`
  margin: 24px 0;
  border-color: rgb(209 213 219);
`;

const TableHeader = styled.div`
  background-color: rgb(229 231 235);
  padding: 12px;
  position: sticky;
  top: 0;
  border-radius: 8px 8px 0 0;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 1fr;
  gap: 8px;
`;

const AccidentsList = styled.div`
  overflow-y: auto;
`;

const AccidentRow = styled.div<{ isSelected: boolean }>`
  padding: 12px;
  border-bottom: 1px solid rgb(229 231 235);
  cursor: pointer;
  &:hover {
    background-color: rgb(249 250 251);
  }
  background-color: ${(props) => (props.isSelected ? "rgb(239 246 255)" : "transparent")};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
`;

const PaginationButton = styled.button`
  padding: 4px 12px;
  border-radius: 4px;
  background: white;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  &:disabled {
    opacity: 0.5;
  }
`;
