<?php

/**
 * Oracle Server layer for DBO
 *
 * PHP 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2005-2011, Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       Cake.Model.Datasource.Database
 * @since         CakePHP(tm) v 0.10.5.1790
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
App::uses('DboSource', 'Model/Datasource');

/**
 * Dbo driver for Oracle
 *
 * A Dbo driver for Oracle 9 and higher.  Requires the `sqlsrv`
 * and `pdo_sqlsrv` extensions to be enabled.
 *
 * @package       Cake.Model.Datasource.Database
 */
class Oracle extends DboSource {

    /**
     * Driver description
     *
     * @var string
     */
    public $description = "Oracle Server DBO Driver";

    /**
     * Database keyword used to assign aliases to identifiers.
     *
     * @var string
     */
    public $alias = ' ';

    /**
     * Starting quote character for quoted identifiers
     *
     * @var string
     */
    public $startQuote = '"';

    /**
     * Ending quote character for quoted identifiers
     *
     * @var string
     */
    public $endQuote = '"';

    /**
     * Creates a map between field aliases and numeric indexes.  Workaround for the
     * SQL Server driver's 30-character column name limitation.
     *
     * @var array
     */
    protected $_fieldMappings = array();

    /**
     * Storing the last affected value
     *
     * @var mixed
     */
    protected $_lastAffected = false;

    /**
     * Base configuration settings for MS SQL driver
     *
     * @var array
     */
    protected $_baseConfig = array(
        'persistent' => true,
        'connection_string' => '//localhost/XE',
        'login' => 'scott',
        'password' => 'tiger',
        'database' => 'cake',
        'nls' => array(),
    );
    
    protected $_nlsSetting = array(
        'NLS_LANGUAGE'=> 'AMERICAN',
        'NLS_TERRITORY'=> 'AMERICA',
        'NLS_CURRENCY'=> '$',
        'NLS_ISO_CURRENCY'=> 'AMERICA',
        'NLS_NUMERIC_CHARACTERS'=> '.,', 
        'NLS_CALENDAR'=> 'GREGORIAN', 
        'NLS_DATE_FORMAT'=> 'YYYY-MM-DD HH24:MI:SS',
        'NLS_TIMESTAMP_FORMAT' => 'YYYY-MM-DD HH24:MI:SS.FF',
        'NLS_DATE_LANGUAGE'=> 'AMERICAN',
        'NLS_SORT'=> 'BINARY'
    );    

    /**
     * MS SQL column definition
     *
     * @var array
     */
    public $columns = array(
        'primary_key' => array('name' => ''),
        'string' => array('name' => 'NVARCHAR2', 'limit' => '255'),
        'text' => array('name' => 'NCLOB'),
        'integer' => array('name' => 'NUMBER', 'formatter' => 'intval'),
        'float' => array('name' => 'FLOAT', 'formatter' => 'floatval'),
        'datetime' => array('name' => 'TIMESTAMP', 'format' => 'Y-m-d H:i:s', 'formatter' => 'date'),
        'timestamp' => array('name' => 'TIMESTAMP', 'format' => 'Y-m-d H:i:s', 'formatter' => 'date'),
        'time' => array('name' => 'TIMESTAMP', 'format' => 'H:i:s', 'formatter' => 'date'),
        'date' => array('name' => 'DATE', 'format' => 'Y-m-d', 'formatter' => 'date'),
        'binary' => array('name' => 'BLOB'),
        'boolean' => array('name' => 'CHAR')
    );

    /**
     * Index of basic SQL commands
     *
     * @var array
     */
    protected $_commands = array(
        'begin' => 'BEGIN TRANSACTION',
        'commit' => 'COMMIT',
        'rollback' => 'ROLLBACK'
    );

    /**
     * Magic column name used to provide pagination support for Oracle
     * which lacks proper limit/offset support.
     */

    const ROW_COUNTER = '_cake_page_rownum_';

    /**
     * The version of Oracle being used.  If greater than 11
     * Normal limit offset statements will be used
     *
     * @var string
     */
    protected $_version;

    /**
     * The version of Oracle being used.  If greater than 11
     * Normal limit offset statements will be used
     *
     * @var string
     */
    protected $_schema;

    /**
     * Connects to the database using options in the given configuration array.
     *
     * @return boolean True if the database could be connected, else false
     * @throws MissingConnectionException
     */
    public function connect() {
        $config = $this->config;
        $this->connected = false;
        try {
            $connection_string = '';

            if (!empty($config['connection_string'])) {
                $connection_string = $config['connection_string'];
            }

            if (empty($connection_string)) {
                if (!empty($config['host'])) {
                    $connection_string = '//' . $config['host'];
                } else {
                    $connection_string = '//localhost';
                }

                if (!empty($config['port'])) {
                    $connection_string.= ':' . $config['port'];
                } else {
                    $connection_string.= ':1521';
                }

                if (!empty($config['service'])) {
                    $connection_string.= '/' . $config['service'];
                }

                if (!empty($config['server_type'])) {
                    $connection_string.= ':' . $config['server_type'];
                }

                if (!empty($config['instance'])) {
                    $connection_string.= '/' . $config['instance'];
                }
            }

            //   new PDO("OCI:dbname=accounts;charset=UTF-8", "username", "password");

            if (!empty($config['schema'])) {
                $this->_schema = $config['schema'];
            }

            $this->connected = false;
            try {
                $flags = array(
                    PDO::ATTR_PERSISTENT => $config['persistent'],
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                );
                if (!empty($config['encoding'])) {
                    $flags[PDO::SQLSRV_ATTR_ENCODING] = $config['encoding'];
                }
                $this->_connection = new PDO(
                                "oci:dbname={$connection_string}",
                                $config['login'],
                                $config['password'],
                                $flags
                );
//                $this->_execute('SET CHARACTER SET utf8');
                $this->connected = true;
            } catch (PDOException $e) {
                throw new MissingConnectionException(array('class' => $e->getMessage()));
            }
            
            $nls = array_merge($this->_nlsSetting, (empty($config['nls'])?array():$config['nls']));
            
            foreach ($nls as $k => $v) {
                $this->_execute("ALTER SESSION SET {$k}='{$v}'");
            }
            
            $result = $this->_execute('SELECT * FROM v$version');

            if (!$result) {
                // raise exception
                return array();
            } else {
                $line = $result->fetch();
                $this->_version = $line['BANNER'];
            }
            $this->connected = true;
        } catch (PDOException $e) {
            throw new MissingConnectionException(array('class' => $e->getMessage()));
        }

        $this->_version = $this->_connection->getAttribute(PDO::ATTR_SERVER_VERSION);
        return $this->connected;
    }

    /**
     * Check that PDO SQL Server is installed/loaded
     *
     * @return boolean
     */
    public function enabled() {
        return in_array('oci', PDO::getAvailableDrivers());
    }

    /**
     * Returns an array of sources (tables) in the database.
     *
     * @param mixed $data
     * @return array Array of table names in the database
     */
    public function listSources($data = null) {
        $cache = parent::listSources();
        if ($cache !== null) {
            return $cache;
        }
        $result = $this->_execute("SELECT table_name  FROM user_tables");

        if (!$result) {
            $result->closeCursor();
            return array();
        } else {
            $tables = array();

            while ($line = $result->fetch()) {
                $tables[] = $line[0];
            }

            $result->closeCursor();
            parent::listSources($tables);
            return $tables;
        }
    }

    /**
     * Returns an array of the fields in given table name.
     *
     * @param Model|string $model Model object to describe, or a string table name.
     * @return array Fields in table. Keys are name and type
     * @throws CakeException
     *
     *
     *
     * TODO Verify DATA_SCALE, AND KEYS, AND SEMANTIC OF NULL, also recheck other field
     */
    public function describe($model) {
        $cache = parent::describe($model);
        if ($cache != null) {
            return $cache;
        }
        $fields = array();
        $table = $this->fullTableName($model, false);
        $cols = $this->_execute(
                'SELECT A.COLUMN_NAME "Field",
            A.DATA_TYPE "Type",
            A.DATA_LENGTH "Length",
            A.NULLABLE "Null",
            A.DATA_DEFAULT "Default",
            C.CONSTRAINT_TYPE "Key",
            A.DATA_SCALE "Size"
            FROM all_tab_columns A
            LEFT JOIN ALL_CONS_COLUMNS B ON A.COLUMN_NAME = B.COLUMN_NAME
            LEFT JOIN ALL_CONSTRAINTS C  ON B.CONSTRAINT_NAME = C.CONSTRAINT_NAME  AND C.CONSTRAINT_TYPE = \'P\'
            WHERE A.TABLE_NAME = \'' . $table . "'", array(), array('NO_CURSOR_SCROLL' => true)
        );
        if (!$cols) {
            throw new CakeException(__d('cake_dev', 'Could not describe table for %s', $table));
        }

        foreach ($cols as $column) {
            $field = $column->Field;
            $fields[$field] = array(
                'type' => $this->column($column),
                'null' => ($column->Null === 'YES' ? true : false),
                'default' => preg_replace("/^[(]{1,2}'?([^')]*)?'?[)]{1,2}$/", "$1", $column->Default),
                'length' => $this->length($column),
                'key' => ($column->Key == '1') ? 'primary' : false
            );

            if ($fields[$field]['default'] === 'null') {
                $fields[$field]['default'] = null;
            } else {
                $this->value($fields[$field]['default'], $fields[$field]['type']);
            }

            if ($fields[$field]['key'] !== false && $fields[$field]['type'] == 'integer') {
                $fields[$field]['length'] = 11;
            } elseif ($fields[$field]['key'] === false) {
                unset($fields[$field]['key']);
            }
            if (in_array($fields[$field]['type'], array('date', 'time', 'datetime', 'timestamp'))) {
                $fields[$field]['length'] = null;
            }
            if ($fields[$field]['type'] == 'float' && !empty($column->Size)) {
                $fields[$field]['length'] = $fields[$field]['length'] . ',' . $column->Size;
            }
        }
        $this->_cacheDescription($table, $fields);
        $cols->closeCursor();
        return $fields;
    }

    /**
     * Generates the fields list of an SQL query.
     *
     * @param Model $model
     * @param string $alias Alias table name
     * @param array $fields
     * @param boolean $quote
     * @return array
     */
    public function fields($model, $alias = null, $fields = array(), $quote = true) {
        if (empty($alias)) {
            $alias = $model->alias;
        }
        $fields = parent::fields($model, $alias, $fields, false);
        $count = count($fields);

        if ($count >= 1 && strpos($fields[0], 'COUNT(*)') === false) {
            $result = array();
            for ($i = 0; $i < $count; $i++) {
                $prepend = '';

                if (strpos($fields[$i], 'DISTINCT') !== false) {
                    $prepend = 'DISTINCT ';
                    $fields[$i] = trim(str_replace('DISTINCT', '', $fields[$i]));
                }

                if (!preg_match('/\s+AS\s+/i', $fields[$i])) {
                    if (substr($fields[$i], -1) == '*') {
                        if (strpos($fields[$i], '.') !== false && $fields[$i] != $alias . '.*') {
                            $build = explode('.', $fields[$i]);
                            $AssociatedModel = $model->{$build[0]};
                        } else {
                            $AssociatedModel = $model;
                        }

                        $_fields = $this->fields($AssociatedModel, $AssociatedModel->alias, array_keys($AssociatedModel->schema()));
                        $result = array_merge($result, $_fields);
                        continue;
                    }

                    if (strpos($fields[$i], '.') === false) {
                        $this->_fieldMappings[$alias . '__' . $fields[$i]] = $alias . '.' . $fields[$i];
                        $fieldName = $this->name($alias . '.' . $fields[$i]);
                        $fieldAlias = $this->name($alias . '__' . $fields[$i]);
                    } else {
                        $build = explode('.', $fields[$i]);
                        $this->_fieldMappings[$build[0] . '__' . $build[1]] = $fields[$i];
                        $fieldName = $this->name($build[0] . '.' . $build[1]);
                        $fieldAlias = $this->name(preg_replace("/^\[(.+)\]$/", "$1", $build[0]) . '__' . $build[1]);
                    }
                    if ($model->getColumnType($fields[$i]) == 'datetime') {
                        $fieldName = "CONVERT(VARCHAR(20), {$fieldName}, 20)";
                    }
                    $fields[$i] = "{$fieldName} {$fieldAlias}";
                }
                $result[] = $prepend . $fields[$i];
            }
            return $result;
        } else {
            return $fields;
        }
    }

    var $_limit = -1;
    var $_offset = -1;

    /**
     * Returns a limit statement in the correct format for the particular database.
     *
     * @param integer $limit Limit of results returned
     * @param integer $offset Offset from which to start results
     * @return string SQL limit/offset statement
     */
    public function limit($limit, $offset = null) {
        if ($limit) {
            $this->_limit = $limit;
        }
        if (!empty($offset)) {
            $this->_offset = $offset;
        }
        return null;
    }

    /**
     * Converts database-layer column types to basic types
     *
     * @param mixed $real Either the string value of the fields type.
     *    or the Result object from Sqlserver::describe()
     * @return string Abstract column type (i.e. "string")
     */
    public function column($real) {
        $limit = null;
        $col = $real;
        if (is_object($real) && isset($real->Field)) {
            $limit = $real->Length;
            $col = $real->Type;
        }

        if ($col == 'datetime2') {
            return 'datetime';
        }
        if (in_array($col, array('date', 'time', 'datetime', 'timestamp'))) {
            return $col;
        }
        if ($col == 'bit') {
            return 'boolean';
        }
        if (strpos($col, 'int') !== false) {
            return 'integer';
        }
        if (strpos($col, 'char') !== false && $limit == -1) {
            return 'text';
        }
        if (strpos($col, 'char') !== false) {
            return 'string';
        }
        if (strpos($col, 'text') !== false) {
            return 'text';
        }
        if (strpos($col, 'binary') !== false || $col == 'image') {
            return 'binary';
        }
        if (in_array($col, array('float', 'real', 'decimal', 'numeric'))) {
            return 'float';
        }
        return 'text';
    }

    /**
     * Handle SQLServer specific length properties.
     * SQLServer handles text types as nvarchar/varchar with a length of -1.
     *
     * @param mixed $length Either the length as a string, or a Column descriptor object.
     * @return mixed null|integer with length of column.
     */
    public function length($length) {
        if (is_object($length) && isset($length->Length)) {
            if ($length->Length == -1 && strpos($length->Type, 'char') !== false) {
                return null;
            }
            if (in_array($length->Type, array('nchar', 'nvarchar'))) {
                return floor($length->Length / 2);
            }
            return $length->Length;
        }
        return parent::length($length);
    }

    /**
     * Builds final SQL statement
     *
     * @param string $type Query type
     * @param array $data Query data
     * @return string
     */
    public function renderStatement($type, $data) {
        switch (strtolower($type)) {
            case 'select':
                extract($data);
                $fields = trim($fields);

                $limit_pre = $limit_post = '';
                if ($this->_limit > 1 || $this->_offset > 0) {
                    $limit_pre = 'SELECT * FROM(SELECT rownum "' . self::ROW_COUNTER . '","' . self::ROW_COUNTER . '".* FROM(';
                    $limit_post = ') "' . self::ROW_COUNTER . '") WHERE ';
                }

                
                
                if ($this->_limit > 1) {
                    $limit_post .= '"' . self::ROW_COUNTER . '" <= ' . ($this->_limit + (($this->_offset > 0) ? $this->_offset : 0));
                }

                if ($this->_offset > 0) {
                    if ($this->_limit > 1) {
                        $limit_post .= ' AND ';
                    }
                    $limit_post .= '"' . self::ROW_COUNTER . '" > ' . $this->_offset;
                }

                return "{$limit_pre}SELECT {$fields} FROM {$table} {$alias} {$joins} {$conditions} {$group} {$order} {$limit_post}";

                break;
            case "schema":
                extract($data);

           /*     foreach ($indexes as $i => $index) {
                    if (preg_match('/PRIMARY KEY/', $index)) {
                        unset($indexes[$i]);
                        break;
                    }
                }*/

                foreach (array('columns', 'indexes') as $var) {
                    if (is_array(${$var})) {
                        ${$var} = " " . implode(", ", ${$var});
                    }
                }

                $sequences = $this->createSequence($table);
                $triggers = $this->createTrigger($table);
                $a = array("CREATE TABLE {$table} ({$columns})","{$indexes}","{$sequences}","{$triggers}");
                return $a;
                break;
            default:
                return parent::renderStatement($type, $data);
                break;
        }
    }

    /**
 * Generate a alter syntax from	CakeSchema::compare()
 *
 * @param mixed $compare
 * @param string $table
 * @return boolean
 */
	public function createSchema($schema, $tableName = null) {
		if (!is_a($schema, 'CakeSchema')) {
			trigger_error(__d('cake_dev', 'Invalid schema object'), E_USER_WARNING);
			return null;
		}
		$out = array();

		foreach ($schema->tables as $curTable => $columns) {
			if (!$tableName || $tableName == $curTable) {
				$cols = $colList = $indexes = $tableParameters = array();
				$primary = null;
				$table = $this->fullTableName($curTable);

				foreach ($columns as $name => $col) {
					if (is_string($col)) {
						$col = array('type' => $col);
					}
					if (isset($col['key']) && $col['key'] === 'primary') {
						$primary = $name;
					}
					if ($name !== 'indexes' && $name !== 'tableParameters') {
						$col['name'] = $name;
						if (!isset($col['type'])) {
							$col['type'] = 'string';
						}
						$cols[] = $this->buildColumn($col);
					} elseif ($name === 'indexes') {
						$indexes = array_merge($indexes, $this->buildIndex($col, $table));
					} elseif ($name === 'tableParameters') {
						$tableParameters = array_merge($tableParameters, $this->buildTableParameters($col, $table));
					}
				}
				if (empty($indexes) && !empty($primary)) {
					$col = array('PRIMARY' => array('column' => $primary, 'unique' => 1));
					$indexes = array_merge($indexes, $this->buildIndex($col, $table));
				}
				$columns = $cols;
				$out = array_merge($out, $this->renderStatement('schema', compact('table', 'columns', 'indexes', 'tableParameters')));
			}
		}
		return $out;
	}
    
    
    /**
     * Creates a database sequence
     *
     * @param string $table
     * @param string $name
     * @return string 
     * @access public
     */
    function createSequence($table, $name = null) {
        if (empty($name))
          $name = Inflector::singularize(preg_replace('/^"(.*)"$/', '$1', $table)) . '_id_seq';
        return "CREATE SEQUENCE \"$name\";";
    }

    /**
     * Create trigger
     *
     * @param string $table
     * @param string $name
     * @param string $sequence
     * 
     * @return mixed
     * @access public
     */
    function createTrigger($table, $name = null, $sequence = null) {
        $table = preg_replace('/^"(.*)"$/', '$1', $table);
        $name = preg_replace('/^"(.*)"$/', '$1', $name);
        return 'CREATE OR REPLACE TRIGGER "'.(empty($name)?'pk_'.Inflector::singularize($table):$name). '_trigger" BEFORE INSERT ON "'.$table.'" FOR EACH ROW BEGIN SELECT "'.(empty($sequence)?Inflector::singularize($table) . '_id_seq' :'sequence').'".NEXTVAL INTO :new."id" FROM DUAL; END;';
    }

    /**
     * Returns a quoted and escaped string of $data for use in an SQL statement.
     *
     * @param string $data String to be prepared for use in an SQL statement
     * @param string $column The column into which this data will be inserted
     * @return string Quoted and escaped data
     */
    public function value($data, $column = null) {
        if (is_array($data) || is_object($data)) {
            return parent::value($data, $column);
        } elseif (in_array($data, array('{$__cakeID__$}', '{$__cakeForeignKey__$}'), true)) {
            return $data;
        }

        if (empty($column)) {
            $column = $this->introspectType($data);
        }

        switch ($column) {
            case 'string':
            case 'text':
                return 'N' . $this->_connection->quote($data, PDO::PARAM_STR);
            default:
                return parent::value($data, $column);
        }
    }

    /**
     * Returns an array of all result rows for a given SQL query.
     * Returns false if no rows matched.
     *
     * @param Model $model
     * @param array $queryData
     * @param integer $recursive
     * @return array Array of resultset rows, or false if no rows matched
     */
    public function read(Model $model, $queryData = array(), $recursive = null) {
        $results = parent::read($model, $queryData, $recursive);
        $this->_fieldMappings = array();
        return $results;
    }

    /**
     * Builds a map of the columns contained in a result
     *
     * @param $row an associative row set
     * @return void
     */
    public function resultSet(array $row) {
        $this->map = array();

        $field = array_keys($row);
        $numFields = count($field);
        $index = 0;

        while ($numFields-- > 0) {

            $name = $field[$index];
            if (strpos($name, '__')) {
                if (isset($this->_fieldMappings[$name]) && strpos($this->_fieldMappings[$name], '.')) {
                    $map = explode('.', $this->_fieldMappings[$name]);
                } elseif (isset($this->_fieldMappings[$name])) {
                    $map = array(0, $this->_fieldMappings[$name]);
                } else {
                    $map = array(0, $name);
                }
            } else {
                $map = array(0, $name);
            }
//            $map[] = // ($column['sqlsrv:decl_type'] == 'bit') ? 'boolean' : $column['native_type']; // TYPE, mboh
            $map[] = 'VARCHAR';
            $this->map[$index++] = $map;
        }
    }

    public function fetchRow($sql = null) {
        if (is_string($sql) && strlen($sql) > 5 && !$this->execute($sql)) {
            return null;
        }

        if ($this->hasResult()) {
            $resultRow = $this->_result->fetch(PDO::FETCH_ASSOC);
            if ($resultRow === false)
                return null;

            $this->resultSet($resultRow);
            $resultRow = $this->fetchResult(array_values($resultRow));
            if (isset($resultRow[0])) {
                $this->fetchVirtualField($resultRow);
            }
            return $resultRow;
        } else {
            return null;
        }
    }

    /**
     * Fetches the next row from the current result set.
     * Eats the magic ROW_COUNTER variable.
     *
     * @return mixed
     */
    public function fetchResult($row = null) {
        if (!is_null($row) || $row = $this->_result->fetch(PDO::FETCH_NUM)) {
            $resultRow = array();
            foreach ($this->map as $col => $meta) {
                list($table, $column, $type) = $meta;
                if ($table === 0 && $column === self::ROW_COUNTER) {
                    continue;
                }
                $resultRow[$table][$column] = $row[$col];
                if ($type === 'boolean' && !is_null($row[$col])) {
                    $resultRow[$table][$column] = $this->boolean($resultRow[$table][$column]);
                }

                /* reads blob */
                if (is_resource($resultRow[$table][$column])) {
                    $resultRow[$table][$column] = stream_get_contents($resultRow[$table][$column]);
                }
            }
            return $resultRow;
        }
        $this->_result->closeCursor();
        return false;
    }

    /**
     * Inserts multiple values into a table
     *
     * @param string $table
     * @param string $fields
     * @param array $values
     * @return void
     */
    public function insertMulti($table, $fields, $values) {
//        $primaryKey = $this->_getPrimaryKey($table);

        $table = $this->fullTableName($table);
        $fields = implode(', ', array_map(array(&$this, 'name'), $fields));
        $this->begin();
        foreach ($values as $value) {
            $holder = implode(', ', array_map(array(&$this, 'value'), $value));
            $this->_execute("INSERT INTO {$table} ({$fields}) VALUES ({$holder})");
        }
        $this->commit();
    }

    /**
     * Generate a database-native column schema string
     *
     * @param array $column An array structured like the following: array('name'=>'value', 'type'=>'value'[, options]),
     *   where options can be 'default', 'length', or 'key'.
     * @return string
    
    public function buildColumn($column) {
        $result = preg_replace('/(int|integer)\([0-9]+\)/i', '$1', parent::buildColumn($column));
        if (strpos($result, 'DEFAULT NULL') !== false) {
            if (isset($column['default']) && $column['default'] === '') {
                $result = str_replace('DEFAULT NULL', "DEFAULT ''", $result);
            } else {
                $result = str_replace('DEFAULT NULL', 'NULL', $result);
            }
        } elseif (array_keys($column) == array('type', 'name')) {
            $result .= ' NULL';
        } elseif (strpos($result, "DEFAULT N'")) {
            $result = str_replace("DEFAULT N'", "DEFAULT '", $result);
        }
        return $result;
    }
 */
    /**
     * Format indexes for create table
     *
     * @param array $indexes
     * @param string $table
     * @return string
     */
    public function buildIndex($indexes, $table = null) {
        $join = array();

        foreach ($indexes as $name => $value) {
            if ($name == 'PRIMARY') {
                $table = preg_replace('/^"(.*)"$/', '$1', $table);
                $join[] = "ALTER TABLE \"{$table}\" ADD CONSTRAINT \"pk_{$table}\" PRIMARY KEY (" . $this->name($value['column']) . ");";
            } else if (isset($value['unique']) && $value['unique']) {
                $out = "ALTER TABLE \"{$table}\" ADD CONSTRAINT \"{$name}\" UNIQUE";

                if (is_array($value['column'])) {
                    $value['column'] = implode(', ', array_map(array(&$this, 'name'), $value['column']));
                } else {
                    $value['column'] = $this->name($value['column']);
                }
                $out .= "({$value['column']});";
                $join[] = $out;
            }
        }
        return $join;
    }

    /**
     * Returns the schema name. Override this in subclasses.
     *
     * @return string schema name
     * @access public
     */
    public function getSchemaName() {
        return $this->_schema;
    }

    /**
     * Makes sure it will return the primary key
     *
     * @param mixed $model Model instance of table name
     * @return string
     */
    protected function _getPrimaryKey($model) {
        if (!is_object($model)) {
            $model = new Model(false, $model);
        }
        $schema = $this->describe($model);
        foreach ($schema as $field => $props) {
            if (isset($props['key']) && $props['key'] == 'primary') {
                return $field;
            }
        }
        return null;
    }

    /**
     * Returns number of affected rows in previous database operation. If no previous operation exists,
     * this returns false.
     *
     * @param mixed $source
     * @return integer Number of affected rows
     */
    public function lastAffected($source = null) {
        $affected = parent::lastAffected();
        if ($affected === null && $this->_lastAffected !== false) {
            return $this->_lastAffected;
        }
        return $affected;
    }

    /**
     * Returns the ID generated from the previous INSERT operation.
     *
     * @param mixed $source
     * @return mixed
     */
    public function lastInsertId($source = null, $id) {
        $result = parent::_execute('select "' . Inflector::singularize($source) . '_' . $id . '_seq".currval "id" from dual');
        if ($line = $result->fetch()) {
            $result->closeCursor();
            return $line[0];
        } else {
            return false;
        }
    }

    /**
     * Executes given SQL statement.
     *
     * @param string or array $sql SQL statement
     * @param array $params list of params to be bound to query (supported only in select)
     * @param array $prepareOptions Options to be used in the prepare statement
     * @return mixed PDOStatement if query executes with no problem, true as the result of a successful, false on error
     * query returning no rows, such as a CREATE statement, false otherwise
     */
    protected function _execute($sql, $params = array(), $prepareOptions = array()) {
        
        if (!is_array($sql))
            $asql=array($sql);
        else
            $asql = $sql;
        foreach ($asql as $sql) {
        $this->_lastAffected = false;
        if (strncasecmp($sql, 'SELECT', 6) == 0) {
            if (empty($prepareOptions['NO_CURSOR_SCROLL']))
                $prepareOptions += array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL);
            return parent::_execute($sql, $params, $prepareOptions);
        }
        try {
            $this->_lastAffected = $this->_connection->exec($sql);
            if ($this->_lastAffected === false) {
                $this->_results = null;
                $error = $this->_connection->errorInfo();
                $this->error = $error[2];
                return false;
            }
            return true;
        } catch (PDOException $e) {
            if (isset($query->queryString)) {
                $e->queryString = $query->queryString;
            } else {
                $e->queryString = $sql;
            }
            throw $e;
        }
        }
    }

    /**
     * Generate a "drop table" statement for the given Schema object
     *
     * @param CakeSchema $schema An instance of a subclass of CakeSchema
     * @param string $table Optional.  If specified only the table name given will be generated.
     *   Otherwise, all tables defined in the schema are generated.
     * @return string
     */
    public function dropSchema(CakeSchema $schema, $table = null) {
        $out = '';
        foreach ($schema->tables as $curTable => $columns) {
            if (!$table || $table == $curTable) {
                $out .= 'DROP TABLE ' . $this->fullTableName($curTable);
            }
        }
        return $out;
    }

}
