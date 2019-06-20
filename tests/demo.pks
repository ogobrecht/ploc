CREATE OR REPLACE PACKAGE demo AUTHID current_user IS
c_demo_name CONSTANT VARCHAR2(30 CHAR) := 'A demo package for PLOC';
/**
Your Leading Level One Header
=============================

You can use standard markdown here to describe your package, functions and procedures.

- This is a list entry
- A second one

[A link to Markdown basics](https://daringfireball.net/projects/markdown/basics).
**/


FUNCTION demo_function (
  p_num_param IN NUMBER,   -- Some short parameter description.
  p_vc2_param IN VARCHAR2) -- Another parameter description.
RETURN BLOB;
/**
Description of the function.

EXAMPLE

```sql
DECLARE
  l_result VARCHAR2(100);
BEGIN
  l_result := demo_function(
    p_num_param => 100,
    p_vc2_param => 'some text'));
  -- do something with the result...
END;
{{/}}
```
**/


PROCEDURE demo_procedure; /** Only a small description. **/

END demo;
