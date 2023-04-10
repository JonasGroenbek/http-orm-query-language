# Query Language

I wanted to design a query language for an API that I was working on. However, I ended up going with another solution. I decided to push it to git in case I ever wanted to finish it.

## Overview

The search query language is a simple language which uses a query string to search for records. The query string is parsed and converted into a query object which is then used to search for records. The language is designed to be simple and easy to use, and is structured being parsed to SQL.
For the sake of demonstration, the type of record we will be searching is a `url` record. A url record has the following fields:

```ts
type Url = {
  id: number;
  source: string;
  destination: string;
  price: number;
  createdByUserId: number;
  createdByUser?: User;
  logs: UrlLog[];
};
```

To demonstrate how to join and use relations with the url, these records will be used:

```ts
type User = {
  id: number;
  email: string;
  address: Address;
};

type Address = {
  id: number;
  streetName: string;
  userId: number;
};

type UrlLog = {
  id: number;
  urlId: number;
  url?: Url;
  content: string;
};
```

## Query structure and terminology

A query clause consists of a token followed by an operator followed by a value and sometimes a clause seperator operator.

clause `source:"url.com/example"`
token `source`
operator `:`
value `url.com/example`

Each query can consist of multiple clauses and each clause has a type. The type of the clause is determined by the token. The token can be a join token, limit token, a offset token or a field token making the clause a join clause, limit clause, offset clause or a field clause respectively.

The logical order of the clauses in the query is important. The clauses are only valid if the types are specified in the order join clauses, limit clause, offset clause, and field clauses.

each query can only have 1 limit clause and 1 offset clause but can have multiple join clauses and field clauses.

query seperator operators are used to seperate field clauses. The two query seperator operators are `and` and `or`.

## Query clause types

There are 4 types of query clauses, and they are depicted by the token that is used.
If the token is a join token then the query clause is a join clause. If the token is a limit token then the query clause is a limit clause. If the token is a offset token then the query clause is a offset clause. If the token is a field token then the query clause is a field clause.

## Query clause token

The query clause token has some keywords that are reserved for special purposes. These keywords are: join, limit, and offset. If none of these are given, it is a field token.

An example query using the join keyword is `join->user join->logs join->user.address limit#50 offset#100 user.email~"url.com" and address.streetName:"some_street"`. Is a query that joins the user, logs, and address tables, and then searches for records where the user email contains `url.com`, and the address street name is `some_street`.

It is worth noting that the join, limit and, offset query clause tokens are not a field tokens. They are reserved for special purposes.

it is required that joins are specified before the limit and offset query clause tokens.

#### Query clause join token

When writing a query that should perform joins, it is important that it is the first clause in the query.

When using the join query clause token, the API will join the tables specified in the query. The join token is followed by a `->` operator, and then a relation to be joined. For example, the query `join->user join->logs join->user.address` is a query that joins the user, logs, and address tables.

It is important that the when accessing a field on a joined relation, to use the alias. You can query relations with the alias by using the `.` operator. For example, the query `user.email:"url.com"` is a query that we know reference a joined field because the field is prefixed with the alias.

#### Query clause Limit and offset token

When using the limit or offset keyword, the API will limit or offset the results. The limit keyword is followed by a `#` operator, and then a number. The offset keyword is followed by a `#` operator, and then a number. For example, the query `limit#50 offset#100` is a query that limits the results to 50 records, and offsets the results by 100 records.

#### Query clause field tokens

Field clause token depicts which property of the record to search for. The value of the field clause token is the name of the field. For example, the query `source:"url.com/example"` is a query that searches for records where the source field is `url.com/example`.

In case of joins, the field clause token is the alias and field seperated by a `.` operator. For example, the query `user.email:"url.com"` is a query that searches for records where the user email is `url.com`.

## Query clause operators

Below is a complete list of all the operators that are supported by the query language. The operators are grouped by clause type which depicts which clause type the operator is supported by.

All the available query operators are listed below:

| clause types | Supported operators | Description                                        |
| ------------ | ------------------- | -------------------------------------------------- |
| join         | `->`                | Join operator                                      |
| limit        | `#`                 | Limit operator                                     |
| offset       | `#`                 | Offset operator                                    |
| field        | `:`                 | Exact match operator (case insensitive)            |
| field        | `!:`                | Exact not match operator (case insensitive)        |
| field        | `~`                 | substring matching operator (case insensitive)     |
| field        | `!~`                | substring not matching operator (case insensitive) |
| field        | `>`                 | Greater than operator                              |
| field        | `<`                 | Less than operator                                 |
| field        | `>=`                | Greater than or equal to operator                  |
| field        | `<=`                | Less than or equal to operator                     |
| field        | `<=`                | Less than or equal to operator                     |

Using an unsupported operator, such as specifying greater than `>` on a join token, returns an error.

#### Field clause operators

Field clauses are special, because the field clause value that determines what operators are supported. For example, the field clause value `source` supports exact matching with a `:` operator. Certain fields such as string fields supports matching. Certain other fields such as amount support numeric comparators like `>` and `<`.

| Field clause value types          | Supported operators | Description                                        |
| --------------------------------- | ------------------- | -------------------------------------------------- |
| string, number, date, and boolean | `:`                 | Exact match operator (case insensitive)            |
| string, number, date, and boolean | `!:`                | Exact not match operator (case insensitive)        |
| string                            | `~`                 | substring matching operator (case insensitive)     |
| string                            | `!~`                | substring not matching operator (case insensitive) |
| number and date                   | `>`                 | Greater than operator                              |
| number and date                   | `<`                 | Less than operator                                 |
| number and date                   | `>=`                | Greater than or equal to operator                  |
| number and date                   | `<=`                | Less than or equal to operator                     |
| number and date                   | `<=`                | Less than or equal to operator                     |

Using an unsupported operator, such as specifying greater than `>` on a string, returns an error.

## Query clause value

#### Field clause values

Field clause values are the values that are used to match against the field.

There are four possible field clause value types: string, number, date, and boolean.

blo
| Field token types | Description | Example |
| ----------------- | ----------------------------------------------------------------------------------------- | --------------------------- |
| string | A sequence of characters in double quotation marks that is not in the ISO 8601 format | field:"some string" |
| date | A date or datetime in double quotation marks in the ISO 8601 format | field:"2023-04-09T14:30:00" |
| number | A numerical value, if decimals they are seperated by a `.` without double quotation marks | field:530432.231 |
| boolean | A `true` or `false` value without double quotation marks | field:false |

#### Join clause values

A join clause value is a relation that is to be joined. The join clause value is the name of the relation.
If it is a relation that is joined from the root table then the join clause value is the name of the relation. If it is a relation that is joined from a joined table then the join clause value is the alias of the joined table and the name of the relation seperated by a `.` operator. The value is not in double quotation marks.

For example, the query `join->user join->user.address` is a query that joins the user, and address tables.

#### Limit and Offset clause values

A limit clause value is a number that is used to limit the number of records returned. The limit clause value is a number without double quotation marks and no decimals.

For example, the query `limit#50` is a query that limits the results to 50 records.

#### Clause seperator operator

The only valid clause seperator operators are `and` and `or` and they are only applicable in queries with multiple field clauses.

If a query has multiple field clauses, then the field clauses has to be seperated by an `and` or an `or` clause seperator operator. For example, the query `destination~"url.com" and source:"url.com"` is a query that searches for records where the url destination contains `url.com`, and the url source is `some_street`.
