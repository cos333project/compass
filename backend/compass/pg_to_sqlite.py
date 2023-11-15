# PostgreSQL to SQLite3 Converter
import sqlite3
import re
import argparse


def clean_sql_command(sql_command):
    """Clean PostgreSQL-specific syntax from SQL command."""
    sql_command = re.sub(r'public\.', '', sql_command)
    sql_command = re.sub(r'WITH \(.*\)', '', sql_command)
    sql_command = re.sub(r'SET .*;', '', sql_command)
    sql_command = re.sub(r'ALTER .*;', '', sql_command)
    sql_command = re.sub(r'GRANT .*;', '', sql_command)
    sql_command = re.sub(r'REVOKE .*;', '', sql_command)
    sql_command = re.sub(r'COMMENT .*;', '', sql_command)
    sql_command = re.sub(r'CREATE SCHEMA .*;', '', sql_command)
    sql_command = re.sub(r'CREATE EXTENSION .*;', '', sql_command)
    sql_command = re.sub(r'SELECT .*;', '', sql_command)
    sql_command = re.sub(r'USING .* \(', '(', sql_command)
    sql_command = re.sub(r'varchar_pattern_ops', '', sql_command)
    sql_command = re.sub(r'\\\.COPY .* FROM stdin;', '', sql_command)
    sql_command = re.sub(r'\\.', '', sql_command)
    sql_command = re.sub(
        r'^[0-9]+[\t ].*$', '', sql_command
    )  # Remove lines that start with numbers followed by tabs or spaces
    return sql_command.strip()


def convert_pg_dump_to_sqlite(pg_dump_path, sqlite_db_path):
    """Convert PostgreSQL SQL dump to SQLite3 database file."""
    conn = sqlite3.connect(sqlite_db_path)
    cursor = conn.cursor()

    # Variables for handling COPY blocks
    in_copy = False
    copy_table = None
    copy_columns = None

    with open(pg_dump_path, 'r', encoding='utf-8') as f:
        sql_command = ''
        for line in f:
            if line.startswith('--') or line.strip() == '':
                continue

            # Handle COPY ... FROM stdin; ... \. blocks separately
            if line.startswith('COPY '):
                in_copy = True
                copy_match = re.match(
                    r'COPY (\w+)(?: \((.*?)\))? FROM stdin;', line.strip()
                )
                if copy_match:
                    copy_table = copy_match.group(1)
                    copy_columns = (
                        copy_match.group(2).split(', ') if copy_match.group(2) else None
                    )
                continue
            elif line.startswith('\\.'):
                in_copy = False
                continue

            # If inside a COPY block, transform to INSERT INTO statements
            if in_copy:
                values = line.strip().split('\t')
                if copy_table and values:
                    if copy_columns:
                        columns_sql = ', '.join(copy_columns)
                        sql_command = f'INSERT INTO {copy_table} ({columns_sql}) VALUES (?{" ,?" * (len(values) - 1)});'
                    else:
                        sql_command = f'INSERT INTO {copy_table} VALUES (?{" ,?" * (len(values) - 1)});'
                    cursor.execute(sql_command, values)
                continue

            sql_command += line.strip()
            if sql_command.endswith(';'):
                sql_command = clean_sql_command(sql_command)
                if not sql_command:
                    sql_command = ''
                    continue
                cursor.execute(sql_command)
                sql_command = ''

    conn.commit()
    conn.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Convert PostgreSQL SQL dump to SQLite3 database file.'
    )
    parser.add_argument(
        'pg_dump_path', type=str, help='Path to the PostgreSQL SQL dump file.'
    )
    parser.add_argument(
        'sqlite_db_path', type=str, help='Path to the output SQLite3 database file.'
    )

    args = parser.parse_args()
    convert_pg_dump_to_sqlite(args.pg_dump_path, args.sqlite_db_path)
