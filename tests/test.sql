CREATE OR REPLACE PACKAGE test_package AUTHID current_user IS
c_test_name    CONSTANT VARCHAR2(30 CHAR) := 'blabla';
c_test_version CONSTANT VARCHAR2(10 CHAR) := '0.1.0';
/**
# Leading Level One Header

Test package comment: package, function, procedure, type, trigger

Test SQL*Plus special characters: {{@}}{{@}}{{#}}{{#}}{{/}}{{/}}
**/

FUNCTION test_package_function (
  p_test_parameter_1 IN my_table.my_column%TYPE, -- Test, if following keywords break the regex: package, function, procedure, type, trigger
  p_test_parameter_2 IN VARCHAR2                 -- Test, if following keywords break the regex: package, function, procedure, type, trigger
) RETURN VARCHAR2;
/**
Test package function comment: package, function, procedure, type, trigger

- A list entry
- Another one
**/

PROCEDURE test_package_procedure (
  p_test_parameter_1 IN VARCHAR2          -- Test, if following keywords break the regex: package, function, procedure, type, trigger
  p_test_parameter_2 IN my_table%ROWTYPE, -- Test, if following keywords break the regex: package, function, procedure, type, trigger
);
/**
Test package procedure comment: package, function, procedure, type, trigger
**/

PROCEDURE test_package_procedure (
  p_test_parameter_3 IN NUMBER    -- Test overloaded procedure to check unique anchor names
  p_test_parameter_4 IN VARCHAR2, 
);
/**
Dummy description
**/

END test_package;
/


CREATE FUNCTION test_function_standalone (
  p_test_parameter_1 IN my_table.my_column%TYPE, -- Test, if following keywords break the regex: package, function, procedure, type, trigger
  p_test_parameter_2 IN VARCHAR2                 -- Test, if following keywords break the regex: package, function, procedure, type, trigger
) RETURN VARCHAR2;
/**
Test function standalone comment: package, function, procedure, type, trigger
**/
/
    

CREATE OR REPLACE TRIGGER test_trigger
BEFORE INSERT OR UPDATE OR DELETE ON my_table
FOR EACH ROW
-- Test, if following keywords break the regex: package, function, procedure, type, trigger
-- Test, if following keywords break the regex: package, function, procedure, type, trigger
-- Test, if following keywords break the regex: package, function, procedure, type, trigger
/**
Test trigger comment: package, function, procedure, type, trigger
**/
BEGIN
  -- Flags are booleans and can be used in any branching construct.
  CASE
    WHEN INSERTING THEN
      -- Include any code specific for when the trigger is fired from an INSERT.
      -- Also fired for INSERT as part of a MERGE.
    WHEN UPDATING THEN
      -- Include any code specific for when the trigger is fired from an UPDATE.
      -- Also fired for UPDATE as part of a MERGE.
    WHEN DELETING THEN
      -- Include any code specific for when the trigger is fired from a DELETE.
      -- Does not fire for DELETE clause of a MERGE.
  END CASE;
END;
/

 
CREATE OR REPLACE TYPE "Test Schema"."Test Object" AS OBJECT (
  first_name  VARCHAR2(50),
  last_name   VARCHAR2(50),
  date_of_birth  DATE,
  MEMBER FUNCTION getAge RETURN NUMBER
);
/**
Test object comment: package, function, procedure, type, trigger
**/
/