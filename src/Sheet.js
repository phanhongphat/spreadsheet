import React, { useState, useCallback, Fragment } from "react";

import Cell from "./Cell";
import { Sheet as StyledSheet } from "./styles";

const getColumnName = index =>
  String.fromCharCode("A".charCodeAt(0) + index - 1);

const Sheet = ({ numberOfRows, numberOfColumns }) => {
  const [data, setData] = useState({});

  const setCellValue = useCallback(
    ({ row, column, value }) => {
      const newData = { ...data };

      newData[`${column}${row}`] = value;
      setData(newData);
    },
    [data, setData]
  );

  const computeCell = useCallback(
    ({ row, column }) => {
      const cellContent = data[`${column}${row}`];
      if (cellContent) {
        if (cellContent.charAt(0) === "=") {
          const alphabetCharacter = ['A','B','C','D','E','F','G','H',
                                      'I','J','K','L','M','N','O','P',
                                      'Q','R','S','T','U','V','W','X','Y','Z']
          let result = 0, tempArray
          if(cellContent.toUpperCase().includes('SUM')) {
            let tempStr = cellContent.slice(cellContent.indexOf('(') + 1, cellContent.indexOf(')'))
            tempArray = tempStr.split(',')
            tempArray.forEach((element) => {
              element = element.trim()
              if(element.includes(':')) {
                const firstArg = alphabetCharacter.indexOf(element.trim().slice(0, 1))
                const firstColNum = element.trim().slice(1, element.indexOf(':'))
                const lastArg = alphabetCharacter.indexOf(element.split(':')[1].trim().slice(0, 1))
                const lastColNum = element.split(':')[1].trim().slice(1, element.indexOf(':'))
                for(let i = firstArg; i <= lastArg; i++) {
                  for(let j = firstColNum; j <= lastColNum; j++) {
                    result += parseFloat(data[(alphabetCharacter[i] + j || "").toUpperCase()])
                  }
                }
              } else {
                result += !isNaN(element) 
                          ? parseFloat(element) 
                          : parseFloat((data[(element || "").toUpperCase()]))
              }
            })
            return result
          }
          // This regex converts = "A1+A2" to ["A1","+","A2"]
          const expression = cellContent.substr(1).split(/([+*-])/g);
          console.log('expression', expression)

          let subStitutedExpression = "";

          expression.forEach(item => {
            // Regex to test if it is of form alphabet followed by number ex: A1
            if (/^[A-z][0-9]$/g.test(item || "")) {
              subStitutedExpression += data[(item || "").toUpperCase()] || 0;
              console.log(subStitutedExpression)
            } else {
              subStitutedExpression += item;
              console.log(subStitutedExpression)
            }
          });

          // @shame: Need to comeup with parser to replace eval and to support more expressions
          try {
            return eval(subStitutedExpression);
          } catch (error) {
            return "ERROR!";
          }
        }
        return cellContent;
      }
      return "";
    },
    [data]
  );

  return (
    <StyledSheet numberOfColumns={numberOfColumns}>
      {Array(numberOfRows)
        .fill()
        .map((m, i) => {
          return (
            <Fragment key={i}>
              {Array(numberOfColumns)
                .fill()
                .map((n, j) => {
                  const columnName = getColumnName(j);
                  return (
                    <Cell
                      rowIndex={i}
                      columnIndex={j}
                      columnName={columnName}
                      setCellValue={setCellValue}
                      currentValue={data[`${columnName}${i}`]}
                      computeCell={computeCell}
                      key={`${columnName}${i}`}
                    />
                  );
                })}
            </Fragment>
          );
        })}
    </StyledSheet>
  );
};

export default Sheet;
