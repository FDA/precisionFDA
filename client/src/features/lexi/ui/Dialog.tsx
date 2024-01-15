/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './Dialog.css';

import * as React from 'react';
import {ReactNode} from 'react';

type Props = Readonly<{
  'data-testid'?: string;
  children: ReactNode;
}>;

export function DialogButtonsList({children}: Props): JSX.Element {
  return <div className="DialogButtonsList">{children}</div>;
}

export function DialogActions({
  'data-testid': dataTestId,
  children,
}: Props): JSX.Element {
  return (
    <div className="DialogActions" data-testid={dataTestId}>
      {children}
    </div>
  );
}
