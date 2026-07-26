export type ScriptParamType = 'string' | 'boolean' | 'number';

export type ScriptScope = 'all' | 'global' | 'local';

export type ScriptParam = {
  name: string;
  type: ScriptParamType;
  default?: unknown;
};

export type ScriptListItem = {
  id: number;
  name: string;
  description: string;
  isGlobal: boolean;
  containerType?: string;
  containerID?: number;
};

export type ScriptFull = {
  id: number;
  name: string;
  code: string;
  description: string;
  params: ScriptParam[];
  isGlobal: boolean;
  containerType?: string;
  containerID?: number;
  createdAt: string;
  updatedAt: string;
};

export type ScriptShort = {
  name: string;
  code: string;
  description: string;
  params: ScriptParam[];
  container?: { id: number; type: string };
};

export type ScriptPartial = {
  name?: string;
  code?: string;
  description?: string;
  params?: ScriptParam[];
};

export type ScriptListQuery = {
  q?: string;
  scope?: ScriptScope;
  containerType?: string;
  containerId?: number;
};

export type ScriptValidateResponse = {
  ok: boolean;
  error?: string;
};

export type ScriptRunCreated = {
  tasks: number[];
  problems: number[];
};

export type ScriptRunResponse = {
  ok: boolean;
  created: ScriptRunCreated;
  error?: string;
};
