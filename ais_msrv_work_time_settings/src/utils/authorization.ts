import { FindOperator, FindOperatorType } from "typeorm";

const changeSQLOperatorToTypeORMOperator = (attribute: {
    operator: string;
    value: any;
  }) => {
    switch (attribute.operator) {
      case '=':
        return new FindOperator('equal', attribute.value);
      case '!=':
        return new FindOperator(
          'not',
          new FindOperator('equal', attribute.value),
        );
      case 'LIKE':
        return new FindOperator('like', attribute.value);
      case 'NOT LIKE':
        return new FindOperator(
          'not',
          new FindOperator('like', attribute.value),
        );
      case '<':
        return new FindOperator('lessThan', attribute.value);
      case '<=':
        return new FindOperator('lessThanOrEqual', attribute.value);
      case '>':
        return new FindOperator('moreThan', attribute.value);
      case '>=':
        return new FindOperator('moreThanOrEqual', attribute.value);
    }
  }

  export const buildArrayWhere = (where: any[], customWhere: { key: string, value: any, operator: FindOperatorType, multipleParameters: boolean }[] = []) => {
    if (where.length == 1 && Object.entries(where[0]).length == 0) {
      const source = {};
      appendCustomWhere(customWhere, source)
      return source;
    }
    let newArray: any[] = [];
    for (let i = 0; i < where.length; i++) {
      let newObject = {};
      let keys = Object.keys(where[i]);
      keys.forEach((element2) => {
        newObject[element2] = changeSQLOperatorToTypeORMOperator(
          where[i][element2],
        );
      });
      appendCustomWhere(customWhere, newObject)
      newArray.push(newObject);
    }
    return newArray;
  }

  const appendCustomWhere = (customWhere: { key: string, value: any, operator: FindOperatorType, multipleParameters: boolean }[], source: any) => {
    customWhere.forEach(where => {
      source[where.key] = new FindOperator(where.operator, where.value, true, where.multipleParameters)
    })
  }