import type { Tree } from '@nx/devkit';
import { readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import hostGenerator from './host';
import { Linter } from '@nx/eslint';

describe('hostGenerator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should generate host files and configs', async () => {
    await hostGenerator(tree, {
      name: 'test',
      style: 'css',
      linter: Linter.None,
      unitTestRunner: 'none',
      e2eTestRunner: 'none',
      projectNameAndRootFormat: 'as-provided',
      typescriptConfiguration: false,
      skipFormat: true,
    });

    expect(tree.exists('test/tsconfig.json')).toBeTruthy();
    expect(tree.exists('test/webpack.config.prod.js')).toBeTruthy();
    expect(tree.exists('test/webpack.config.js')).toBeTruthy();
    expect(tree.exists('test/module-federation.config.js')).toBeTruthy();
    expect(tree.exists('test/src/bootstrap.tsx')).toBeTruthy();
    expect(tree.exists('test/src/main.ts')).toBeTruthy();
    expect(tree.read('test/webpack.config.js', 'utf-8')).toMatchSnapshot();
    expect(
      tree.read('test/module-federation.config.js', 'utf-8')
    ).toMatchSnapshot();
  });

  it('should generate host files and configs when --typescriptConfiguration=true', async () => {
    await hostGenerator(tree, {
      name: 'test',
      style: 'css',
      linter: Linter.None,
      unitTestRunner: 'none',
      e2eTestRunner: 'none',
      projectNameAndRootFormat: 'as-provided',
      typescriptConfiguration: true,
      skipFormat: true,
    });

    expect(tree.exists('test/tsconfig.json')).toBeTruthy();
    expect(tree.exists('test/webpack.config.prod.ts')).toBeTruthy();
    expect(tree.exists('test/webpack.config.ts')).toBeTruthy();
    expect(tree.exists('test/module-federation.config.ts')).toBeTruthy();
    expect(tree.exists('test/src/bootstrap.tsx')).toBeTruthy();
    expect(tree.exists('test/src/main.ts')).toBeTruthy();
    expect(tree.read('test/webpack.config.ts', 'utf-8')).toMatchSnapshot();
    expect(
      tree.read('test/module-federation.config.ts', 'utf-8')
    ).toMatchSnapshot();
  });

  it('should install @nx/web for the file-server executor', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await hostGenerator(tree, {
      name: 'test',
      style: 'css',
      linter: Linter.None,
      unitTestRunner: 'none',
      e2eTestRunner: 'none',
      projectNameAndRootFormat: 'as-provided',
      skipFormat: true,
    });

    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.devDependencies['@nx/web']).toBeDefined();
  });

  it('should generate host files and configs for SSR', async () => {
    await hostGenerator(tree, {
      name: 'test',
      ssr: true,
      style: 'css',
      linter: Linter.None,
      unitTestRunner: 'none',
      e2eTestRunner: 'none',
      projectNameAndRootFormat: 'as-provided',
      typescriptConfiguration: false,
    });

    expect(tree.exists('test/tsconfig.json')).toBeTruthy();
    expect(tree.exists('test/webpack.config.prod.js')).toBeTruthy();
    expect(tree.exists('test/webpack.server.config.js')).toBeTruthy();
    expect(tree.exists('test/webpack.config.js')).toBeTruthy();
    expect(tree.exists('test/module-federation.config.js')).toBeTruthy();
    expect(tree.exists('test/module-federation.server.config.js')).toBeTruthy();
    expect(tree.exists('test/src/main.server.tsx')).toBeTruthy();
    expect(tree.exists('test/src/bootstrap.tsx')).toBeTruthy();
    expect(tree.exists('test/src/main.ts')).toBeTruthy();

    expect(readJson(tree, 'test/tsconfig.server.json')).toEqual({
      compilerOptions: {
        outDir: '../../out-tsc/server',
        target: 'es2019',
        types: [
          'node',
          '@nx/react/typings/cssmodule.d.ts',
          '@nx/react/typings/image.d.ts',
        ],
      },
      extends: './tsconfig.app.json',
      include: ['src/remotes.d.ts', 'src/main.server.tsx', 'server.ts'],
    });

    expect(
      tree.read('test/webpack.server.config.js', 'utf-8')
    ).toMatchSnapshot();
    expect(
      tree.read('test/module-federation.server.config.js', 'utf-8')
    ).toMatchSnapshot();
  });

  it('should generate host files and configs for SSR when --typescriptConfiguration=true', async () => {
    await hostGenerator(tree, {
      name: 'test',
      ssr: true,
      style: 'css',
      linter: Linter.None,
      unitTestRunner: 'none',
      e2eTestRunner: 'none',
      projectNameAndRootFormat: 'as-provided',
      typescriptConfiguration: true,
    });

    expect(tree.exists('test/tsconfig.json')).toBeTruthy();
    expect(tree.exists('test/webpack.config.prod.ts')).toBeTruthy();
    expect(tree.exists('test/webpack.server.config.ts')).toBeTruthy();
    expect(tree.exists('test/webpack.config.ts')).toBeTruthy();
    expect(tree.exists('test/module-federation.config.ts')).toBeTruthy();
    expect(tree.exists('test/module-federation.server.config.ts')).toBeTruthy();
    expect(tree.exists('test/src/main.server.tsx')).toBeTruthy();
    expect(tree.exists('test/src/bootstrap.tsx')).toBeTruthy();
    expect(tree.exists('test/src/main.ts')).toBeTruthy();

    expect(readJson(tree, 'test/tsconfig.server.json')).toEqual({
      compilerOptions: {
        outDir: '../../out-tsc/server',
        target: 'es2019',
        types: [
          'node',
          '@nx/react/typings/cssmodule.d.ts',
          '@nx/react/typings/image.d.ts',
        ],
      },
      extends: './tsconfig.app.json',
      include: ['src/remotes.d.ts', 'src/main.server.tsx', 'server.ts'],
    });

    expect(
      tree.read('test/webpack.server.config.ts', 'utf-8')
    ).toMatchSnapshot();
    expect(
      tree.read('test/module-federation.server.config.ts', 'utf-8')
    ).toMatchSnapshot();
  });

  it('should generate a host and remotes in a directory correctly when using --projectNameAndRootFormat=as-provided', async () => {
    const tree = createTreeWithEmptyWorkspace();

    await hostGenerator(tree, {
      name: 'host-app',
      directory: 'foo/host-app',
      remotes: ['remote1', 'remote2', 'remote3'],
      projectNameAndRootFormat: 'as-provided',
      e2eTestRunner: 'none',
      linter: Linter.None,
      style: 'css',
      unitTestRunner: 'none',
      typescriptConfiguration: false,
    });

    expect(tree.exists('foo/remote1/project.json')).toBeTruthy();
    expect(tree.exists('foo/remote2/project.json')).toBeTruthy();
    expect(tree.exists('foo/remote3/project.json')).toBeTruthy();
    expect(
      tree.read('foo/host-app/module-federation.config.js', 'utf-8')
    ).toContain(`'remote1', 'remote2', 'remote3'`);
  });

  it('should generate a host and remotes in a directory correctly when using --projectNameAndRootFormat=as-provided and --typescriptConfiguration=true', async () => {
    const tree = createTreeWithEmptyWorkspace();

    await hostGenerator(tree, {
      name: 'host-app',
      directory: 'foo/host-app',
      remotes: ['remote1', 'remote2', 'remote3'],
      projectNameAndRootFormat: 'as-provided',
      e2eTestRunner: 'none',
      linter: Linter.None,
      style: 'css',
      unitTestRunner: 'none',
      typescriptConfiguration: true,
    });

    expect(tree.exists('foo/remote1/project.json')).toBeTruthy();
    expect(tree.exists('foo/remote2/project.json')).toBeTruthy();
    expect(tree.exists('foo/remote3/project.json')).toBeTruthy();
    expect(
      tree.read('foo/host-app/module-federation.config.ts', 'utf-8')
    ).toContain(`'remote1', 'remote2', 'remote3'`);
  });
});
