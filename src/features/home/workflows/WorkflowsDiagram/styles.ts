import styled from 'styled-components'

export const StyledWorkflowDiagram = styled.div`
  .input-configured {
    width: 220px;
    height: 80px;
    background-color: #F4F2F2;
    border-color: #cfa5e0;
    border-radius: 10px;
    border-style: solid;
    border-width: 2px;

    svg {
      margin-bottom: -1px;
      margin-right: 4px;
    }
}

.workflows {
    margin: 0;
    padding: 0 10px;
}

.wf-diagram {
    padding: 20px;
}

.wf-diagram-arrows {
    position: relative;
    height: 30px;
}

.wf-diagram-slots {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
}

.shifted-io {
    display: inline-block;
    padding-left: 15px;
}

.glyphicon {
    position: relative;
    top: 1px;
    display: inline-block;
    font-family: 'Glyphicons Halflings';
    font-style: normal;
    font-weight: normal;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.workflow-digaram-gly {
    color: #1F70B5;
}

`
