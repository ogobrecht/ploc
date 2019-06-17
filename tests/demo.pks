CREATE OR REPLACE PACKAGE DEMO AUTHID current_user IS
c_demo_name CONSTANT VARCHAR2(30 CHAR) := 'A demo package for PLOC';
/**
PL/SQL Demo Package
===================

You can use standard markdown here to describe your package, functions and procedures.

- This is a list entry
- A second one

[A link](https://daringfireball.net/projects/markdown/basics).
**/


FUNCTION to_zip (
  p_file_collection IN apex_t_export_files -- The file collection to process with APEX_ZIP.
) RETURN BLOB;
/**
Convert a file collection to a zip file.

EXAMPLE

```sql
DECLARE
  l_zip BLOB;
BEGIN
    l_zip := plex.to_zip(plex.backapp(
      p_app_id             => 100,
      p_include_object_ddl => true
    ));

  -- do something with the zip file...
END;
{{/}}
```
**/

END DEMO;
