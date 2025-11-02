import { defineConfig } from '@kubb/core';
import { pluginClient } from '@kubb/plugin-client';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';
import { pluginReactQuery } from '@kubb/plugin-react-query';

const capitalize = (s) =>
  typeof s === 'string' && s.length ? s[0].toUpperCase() + s.slice(1) : s;

const groupFormatter = (group) => {
  return group
    ? group
        .split(/[_\s-]+/)
        .map(capitalize)
        .join('')
    : 'Default';
};

export default defineConfig(() => {
  return {
    root: '.',
    input: {
      path: 'https://info-run.ru/api/openapi.json',
    },
    output: {
      path: './src/shared/api/generate/',
      clean: true,
    },
    plugins: [
      pluginOas({ validate: true }),
      pluginTs({
        output: {
          path: './types',
          enumType: 'enum',
        },
        enumType: 'enum',
        syntaxType: 'interface',
        unknownType: 'unknown',
        group: {
          type: 'tag',
          name: ({ group }) => groupFormatter(group),
        },
      }),
      pluginClient({
        output: {
          path: './services',
          barrelType: 'named',
        },
        group: {
          type: 'tag',
          name: ({ group }) => `${groupFormatter(group)}Service`,
        },
        parser: 'zod',
        paramsCasing: 'camelcase',
        paramsType: 'object',
        pathParamsType: 'object',
        dataReturnType: 'data',
      }),
      pluginZod({
        output: {
          path: './zod',
          type: true
        },
        group: {
          type: 'tag',
          name: ({ group }) => `${groupFormatter(group)}Schemas`,
        },
        typed: true,
        dateType: 'stringOffset',
        unknownType: 'unknown',
        importPath: 'zod',
      }),
      pluginReactQuery({
        output: {
          path: './hooks',
        },
        group: {
          type: 'tag',
          name: ({ group }) => `${groupFormatter(group)}Hooks`,
        },
        client: {
          dataReturnType: 'data',
        },
        mutation: {
          methods: ['post', 'put', 'delete'],
        },
        infinite: {
          queryParam: 'next_page',
          initialPageParam: 0,
          cursorParam: 'nextCursor',
        },
        query: {
          methods: ['get'],
          importPath: '@tanstack/react-query',
        },
        suspense: {},
      }),
    ],
  };
});
