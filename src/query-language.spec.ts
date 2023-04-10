import { QueryLanguageService } from "./query-language";


describe('queryLanguage.service.ts', () => {
    let queryLanguageService =  new QueryLanguageService();

  it('QueryLanguageService is defined"', () => {
    expect(queryLanguageService).toBeDefined();
  });

  describe('parseQuery()', () => {
    it('should parse a query string into an array of QueryClause objects', () => {
      expect(queryLanguageService.parseQuery('id:1')).toEqual([
        { token: 'id', operator: ':', value: 1 },
      ]);
    });

    it('parseQuery() should parse a query string into an array of QueryClause objects with an and clause', () => {
      expect(queryLanguageService.parseQuery('id:1 and field:2')).toEqual([
        { token: 'id', operator: ':', value: 1, querySeperator: 'and' },
        { token: 'field', operator: ':', value: 2 },
      ]);
    });

    it('parseQuery() should parse a query string into an array of QueryClause objects with join, limit, offset and multiple field clauses using joined relations', () => {
      const query =
        'join->user limit#50 offset#100 id:1 and field:2 or user.id!:1';
      const result = queryLanguageService.parseQuery(query);

      expect(result[0]).toEqual({
        token: 'join',
        operator: '->',
        value: 'user',
      });
      expect(result[1]).toEqual({ token: 'limit', operator: '#', value: 50 });
      expect(result[2]).toEqual({ token: 'offset', operator: '#', value: 100 });
      expect(result[3]).toEqual({
        token: 'id',
        operator: ':',
        value: 1,
        querySeperator: 'and',
      });
      expect(result[4]).toEqual({
        token: 'field',
        operator: ':',
        value: 2,
        querySeperator: 'or',
      });
      expect(result[5]).toEqual({ token: 'user.id', operator: '!:', value: 1 });
    });

    it('parseQuery() given the query field:2.1 expect parseQuery to return the clause with a value of type number', () => {
      const query = 'field:2.1';
      const result = queryLanguageService.parseQuery(query);
      expect(result[0].value === 2.1).toBeTruthy();
      expect(typeof result[0].value === 'number').toBeTruthy();
    });

    it('parseQuery() given the query field:"2023-04-09T12:34:56+00:00" expect parseQuery to return the clause with a value of type Date', () => {
      const query = 'field:"2023-04-09T12:34:56+00:00"';
      const result = queryLanguageService.parseQuery(query);
      expect(result[0].value instanceof Date).toBeTruthy();
    });

    it('parseQuery() given the query field:""""1"2""" field2:"3""1" user.id:1 expect to return the values escaping only outer double quotation marks', () => {
      const query = 'field:"""1"2""" field2:"3""1" user.id:1';
      const result = queryLanguageService.parseQuery(query);
      expect(result[0].value).toEqual('""1"2""');
      expect(result[1].value).toEqual('3""1');
      expect(result[2].value).toEqual(1);
    });
  });

  describe('parseFieldValue()', () => {
    it('parseFieldValue() given 2.1 expect return 2.1 as number', () => {
      expect(queryLanguageService.parseFieldValue('2.1')).toEqual(2.1);
    });

    it('parseFieldValue() given 2023-04-09T12:34:56+00:00 expect return 2023-04-09T12:34:56+00:00 as Date', () => {
      expect(
        queryLanguageService.parseFieldValue('"2023-04-09T12:34:56+00:00"'),
      ).toEqual(new Date('2023-04-09T12:34:56+00:00'));
    });

    it('parseFieldValue() given "2023-04-09T12:34:56+00:00" expect return 2023-04-09T12:34:56+00:00 as Date', () => {
      expect(
        queryLanguageService.parseFieldValue('"2023-04-09T12:34:56+00:00"'),
      ).toEqual(new Date('2023-04-09T12:34:56+00:00'));
    });

    it(`parseFieldValue() given true expect return true as a boolean`, () => {
      expect(queryLanguageService.parseFieldValue('true')).toEqual(true);
    });

    it(`parseFieldValue() given false expect return true as a boolean`, () => {
      expect(queryLanguageService.parseFieldValue('false')).toEqual(false);
    });

    it(`parseFieldValue() given "true" expect return true as string"`, () => {
      expect(queryLanguageService.parseFieldValue('"true"')).toEqual('true');
    });

    it(`parseFieldValue() given "false" expect return false as strign`, () => {
      expect(queryLanguageService.parseFieldValue('"false"')).toEqual('false');
    });
  });
});
