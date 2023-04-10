interface QueryClause {
  token: string;
  operator:
    | '->'
    | `#`
    | `#`
    | `=`
    | `!=`
    | `~`
    | `!~`
    | `>`
    | `<`
    | `>=`
    | `<=`;
  value: string | number | boolean | Date;
  querySeperator?: 'or' | 'and';
}

export class QueryLanguageService {
  splitQuery(query: string): string[] {
    // Match quoted strings and replace them with placeholders
    const placeholders: string[] = [];
    const escapedQuery = query.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"|\S+/g,
      (match, quoted) => {
        if (quoted != null) {
          placeholders.push(quoted);
          return `__PLACEHOLDER_${placeholders.length - 1}__`;
        } else {
          return match;
        }
      },
    );

    // Split the remaining text by spaces
    const parts: string[] = escapedQuery.split(/\s+/);

    // Restore the original quoted strings
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith('__PLACEHOLDER_')) {
        const index = parseInt(parts[i].substr(12), 10);
        parts[i] = placeholders[index];
      }
    }

    return parts;
  }
  parseQuery(query: string): QueryClause[] {
    const clauses: QueryClause[] = [];

    // Split the query string into individual clauses
    const clauseStrings = this.splitQuery(query);

    // Parse each clause string into a QueryClause object
    for (let index = 0; index < clauseStrings.length; index++) {
      const clauseString = clauseStrings[index];

      if (clauseString === 'and' || clauseString === 'or') {
        continue;
      }

      const clauseParts = clauseString.split(/(:|!:|~|!~|>|>=|<|<=|#|->)/);
      const token = clauseParts[0].trim();
      const operator = clauseParts[1].trim() as QueryClause['operator'];
      const value = clauseParts.slice(2).join('');
      let querySeperator: QueryClause['querySeperator'] = undefined;

      if (
        clauseStrings.length > index + 1 &&
        (clauseStrings[index + 1] === 'or' ||
          clauseStrings[index + 1] === 'and')
      ) {
        querySeperator = clauseStrings[
          index + 1
        ] as QueryClause['querySeperator'];
      }

      if (token.startsWith('join')) {
        clauses.push({
          token,
          operator: operator,
          value: value,
        });
      } else if (token === 'limit') {
        clauses.push({
          token,
          operator: '#',
          value: Number(value),
        });
      } else if (token === 'offset') {
        clauses.push({
          token,
          operator: '#',
          value: Number(value),
        });
      } else {
        clauses.push({
          token,
          operator,
          value: this.parseFieldValue(value),
          querySeperator,
        });
      }
    }

    return clauses;
  }

  parseFieldValue(fieldValue: string): string | number | boolean | Date {
    // Checking if the fieldValue is a string
    if (fieldValue.startsWith('"') && fieldValue.endsWith('"')) {
      const unquotedValue = fieldValue.slice(1, -1);
      // Checking if the unquoted value is an ISO 8601 date string
      const isoDateRegex =
        /^(\d{4})-(\d{2})-(\d{2})([Tt ](\d{2}):(\d{2}):(\d{2})(\.\d{1,3})?(Z|([+\-])(\d{2}):(\d{2})))?$/;
      if (isoDateRegex.test(unquotedValue)) {
        return new Date(unquotedValue);
      }
      return unquotedValue;
    }

    // Checking if the fieldValue is a number
    if (!isNaN(parseFloat(fieldValue))) {
      return parseFloat(fieldValue);
    }

    // Checking if the fieldValue is a boolean
    if (fieldValue === 'true' || fieldValue === 'false') {
      return fieldValue === 'true';
    }

    throw new Error('The following is an invalid fieldValue: ' + fieldValue);
  }
}
