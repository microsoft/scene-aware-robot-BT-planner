import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-sqlserver";
import "../../libs/mistreevous-visualiser/mode-mdsl";

import Alert from "@mui/material/Alert/Alert";
import Typography from "@mui/material/Typography/Typography";
import { Chip, Divider } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';

import './DefinitionEditor.css';

interface DefinitionEditorProps {
  /** The definition value. */
  definition: string;

  /** The callback for definition value changes. */
  onChange(value: string): void

  /** The definition error message. */
  errorMessage?: string;

  readOnly: boolean;

  onConfirmButtonClicked(): void;
}

const DefinitionEditor = ({ definition, onChange, errorMessage, readOnly, onConfirmButtonClicked }: DefinitionEditorProps) => {
  return (
    <div className="sidebar-tab definition-tab">
      <div className="definition-tab-header">
        <Typography className="sidebar-tab-title" variant="overline">Definition</Typography>
        <div className="definition-tab-header-chip-container">
          <Chip className="definition-tab-header-chip" label="Confirm" icon={<CheckIcon />} size="small" onClick={() => onConfirmButtonClicked()} color="primary" disabled={!definition || !!errorMessage}/>
        </div>
      </div>
      <Divider />
      <AceEditor
          className="definition-tab-ace-editor"
          value={definition}
          onChange={(value) => onChange(value)}
          readOnly={readOnly}
          width="100%"
          height="inherit"
          mode="mdsl"
          theme="sqlserver"
          setOptions={{
            useWorker: false,
            showLineNumbers: true,
            showGutter: true,
            displayIndentGuides: false,
            showPrintMargin: false,
            wrap: true
          }}
        />
      {definition && errorMessage && (
        <Alert className="sidebar-tab-alert" severity="error">
          {errorMessage}
        </Alert>
      )}
    </div>
  );
}

export default DefinitionEditor;
