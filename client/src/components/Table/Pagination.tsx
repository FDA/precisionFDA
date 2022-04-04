import React from "react";
import styled from "styled-components";
import { ArrowIcon } from "../icons/ArrowIcon";
import { Svg } from "../icons/Svg";
import { Button } from '../../components/Button'

const StyledPagination = styled.div`
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  padding-right: 0.5rem;
  box-shadow: -17px 0px 11px -7px #ffffff;
`;

export interface IPagination {
  gotoPage: (updater: number | ((pageIndex: number) => number)) => void;
  canPreviousPage: boolean;
  previousPage: () => void;
  nextPage: () => void;
  canNextPage: boolean;
  pageCount: number;
  pageOptions: any;
  pageIndex: number;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const PaginationArrows = styled(ArrowIcon)<{ direction: 'left' | 'right'}>`
  ${({ direction }) => direction === 'right' ? 'transform: rotate(-90deg);' : 'transform: rotate(90deg);'}

  ${Svg} {
    margin-top: 0.4rem;
    margin-bottom: 0.4rem;
  }
`;

const PageNumberOf = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
`;

export const Pagination = ({
  canPreviousPage,
  previousPage,
  nextPage,
  canNextPage,
  pageOptions,
  pageIndex,
}: IPagination) => {
  if (pageOptions.length > 0) {
    return (
      <StyledPagination>
        <PageNumberOf>
          <span>Page &nbsp;</span>
          <strong>
          {pageIndex + 1} of {pageOptions.length}
          </strong>
        </PageNumberOf>
        <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
          <PaginationArrows direction="left" />
        </Button>{" "}
        <Button onClick={() => nextPage()} disabled={!canNextPage}>
          <PaginationArrows direction="right" />
        </Button>{" "}
      </StyledPagination>
    )
  } else {
    return null
  }
};
