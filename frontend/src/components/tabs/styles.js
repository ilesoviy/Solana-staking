import styled, { css } from "styled-components";

export const TabHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media(max-width: 648px) {
    overflow-x: scroll;
  }
`;

export const StylizedTab = styled.button`
  width: 100%;
  padding: 8px 16px;
  // margin: 0.5rem 0.8rem;
  color: white;
  background: transparent;
  mix-blend-mode: normal;
  border-radius: 8px;
  // font-family: Sora;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px; /* 142.857% */
  letter-spacing: -0.1px;
  border: none;
  border-bottom-color: none;
  outline: none;
  border:none;
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  ${(p) =>
    p.active &&
    css`
      font-weight: bold;
      outline: none;
      border:none;
      background: #4628FF;
    `}
  ${(p) => !p.active && p.inactiveStyle}
`;

export const StyledTabPanel = styled.div`
  display: ${(p) => (p.active ? "flex" : "none")};
  flex-direction: column;
  justify-content: center;
  border-radius: 8px;
  padding: 8px 16px;
  width: 100%;
`;

export const TabsHolder = styled.div`
  display: flex;
  /* can be used to stack them vertically by using column*/
  flex-direction: row;
  background: #03132C;
  border-radius: 8px;
  width: 100%;
  align-self: center;
  // margin: 50px 0px;
  padding: 4px;
  gap: 8px;
  @media(max-width: 1024px) {
    width: 100%;
  }
`;

export const inactiveTab = {
  opacity: 0.55
};

// width, index,
/**
 * [0] [1] [2] ...
 * W * index
 *
 */