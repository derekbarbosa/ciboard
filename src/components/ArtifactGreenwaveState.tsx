/*
 * This file is part of ciboard

 * Copyright (c) 2021, 2022 Andrei Stepanov <astepano@redhat.com>
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import {
    Button,
    DataListCell,
    DataListContent,
    DataListItem,
    DataListItemCells,
    DataListItemRow,
    DataListToggle,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Flex,
    FlexItem,
    Label,
    Text,
    TextContent,
} from '@patternfly/react-core';

import {
    OutlinedThumbsUpIcon,
    RedoIcon,
    RegisteredIcon,
    WeeblyIcon,
} from '@patternfly/react-icons';

import styles from '../custom.module.css';
import { renderStatusIcon, timestampForUser } from '../utils/artifactUtils';
import { Artifact, StateGreenwaveType } from '../artifact';
import { ArtifactStateProps } from './ArtifactState';
import {
    LinkifyNewTab,
    StateDetailsEntry,
    StateLink,
    mkLabel,
    mkPairs,
} from './ArtifactState';
import { createWaiver } from '../actions';
import classnames from 'classnames';

interface WaiveButtonProps {
    artifact: Artifact;
    state: StateGreenwaveType;
}

export const WaiveButton: React.FC<WaiveButtonProps> = (props) => {
    const { state, artifact } = props;
    const { requirement } = state;
    const dispatch = useDispatch();
    if (_.isNil(requirement?.testcase)) {
        return null;
    }
    const onClick: React.MouseEventHandler = (e) => {
        e.stopPropagation();
        dispatch(createWaiver(artifact, state));
    };
    return (
        <Button
            variant="control"
            onClick={onClick}
            isSmall
            className={styles.actionButton}
        >
            <OutlinedThumbsUpIcon /> <span>waive</span>
        </Button>
    );
};

interface GreenwaveReTestButtonProps {
    state: StateGreenwaveType;
}

export const GreenwaveReTestButton: React.FC<GreenwaveReTestButtonProps> = (
    props,
) => {
    const { state } = props;
    const { result } = state;
    const rebuildUrl: string | undefined = _.get(result, 'data.rebuild[0]');
    if (_.isNil(rebuildUrl)) {
        return null;
    }
    return (
        <a
            href={rebuildUrl}
            key={result?.testcase.name}
            target="_blank"
            title="Rerun testing. Note login to the linked system might be required."
            rel="noopener noreferrer"
        >
            <Button
                variant="control"
                className={styles.actionButton}
                isSmall
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <RedoIcon style={{ height: '0.8em' }} /> <span>rerun</span>
            </Button>
        </a>
    );
};

interface GreenwaveStateActionsProps {
    artifact: Artifact;
    state: StateGreenwaveType;
}

export const GreenwaveStateActions: React.FC<GreenwaveStateActionsProps> = (
    props,
) => {
    const { state, artifact } = props;
    return (
        <Flex style={{ minWidth: '15em' }}>
            <Flex flex={{ default: 'flex_1' }}>
                <WaiveButton state={state} artifact={artifact} />
            </Flex>
            <Flex flex={{ default: 'flex_1' }}>
                <GreenwaveReTestButton state={state} />
            </Flex>
        </Flex>
    );
};

const resultMapping = [
    ['submit_time', 'submited', _.partialRight(timestampForUser, true)],
    ['id', 'result id'],
    ['href', 'resultsdb url'],
    ['note', 'note'],
    ['outcome', 'outcome'],
    /**
     * based on internal resultdb logic
     * https://github.com/release-engineering/resultsdb-updater/pull/131
     * https://issues.redhat.com/browse/RHELWF-5987
     */
    ['testcase.ref_url', 'testcase info'],
];

interface GreenwaveResultInfoProps {
    state: StateGreenwaveType;
}

export const GreenwaveResultInfo: React.FC<GreenwaveResultInfoProps> = (
    props,
) => {
    const { state } = props;
    if (!state.result) {
        return null;
    }
    const pairs = mkPairs(resultMapping, state.result);
    if (_.isEmpty(pairs)) {
        return null;
    }
    const elements: JSX.Element[] = _.map(pairs, ([name, value]) =>
        mkLabel(name, value, 'orange'),
    );
    return (
        <StateDetailsEntry caption="Result info">
            <Flex>
                <FlexItem>
                    <DescriptionList
                        isCompact
                        isHorizontal
                        columnModifier={{
                            default: '2Col',
                        }}
                    >
                        {elements}
                    </DescriptionList>
                </FlexItem>
            </Flex>
        </StateDetailsEntry>
    );
};

const waiverMapping = [
    ['comment', 'comment'],
    ['id', 'id'],
    ['scenario', 'scenario'],
    ['timestamp', 'time', _.partialRight(timestampForUser, true)],
    ['username', 'username'],
    ['waived', 'waived'],
];

interface GreenwaveWaiverProps {
    state: StateGreenwaveType;
}

export const GreenwaveWaiver: React.FC<GreenwaveWaiverProps> = (props) => {
    const { state } = props;
    if (!state.waiver) {
        return null;
    }
    const pairs = mkPairs(waiverMapping, state.waiver);
    if (_.isEmpty(pairs)) {
        return null;
    }
    const elements: JSX.Element[] = _.map(pairs, ([name, value]) =>
        mkLabel(name, value, 'red'),
    );
    return (
        <StateDetailsEntry caption="Waiver info">
            <Flex>
                <FlexItem>
                    <DescriptionList
                        isCompact
                        isHorizontal
                        columnModifier={{
                            default: '2Col',
                        }}
                    >
                        {elements}
                    </DescriptionList>
                </FlexItem>
            </Flex>
        </StateDetailsEntry>
    );
};

interface GreenwaveRequirementProps {
    state: StateGreenwaveType;
}

export const GreenwaveRequirement: React.FC<GreenwaveRequirementProps> = (
    props,
) => {
    const { state } = props;
    const pairs = mkPairs(waiverMapping, state);
    if (_.isEmpty(pairs)) {
        return null;
    }
    const elements: JSX.Element[] = _.map(pairs, ([name, value]) =>
        mkLabel(name, value, 'blue'),
    );
    return (
        <StateDetailsEntry caption="Requirement info">
            <Flex>
                <FlexItem>
                    <DescriptionList
                        isCompact
                        isHorizontal
                        columnModifier={{
                            default: '2Col',
                        }}
                    >
                        {elements}
                    </DescriptionList>
                </FlexItem>
            </Flex>
        </StateDetailsEntry>
    );
};

interface GreenwaveResultDataProps {
    state: StateGreenwaveType;
}

export const GreenwaveResultData: React.FC<GreenwaveResultDataProps> = (
    props,
) => {
    const { state } = props;
    const { result } = state;
    if (_.isUndefined(result) || !_.isObject(result?.data)) {
        return null;
    }
    const mkItem = (name: string, values: string[]): JSX.Element => {
        const valuesRendered: Array<JSX.Element | string> = _.map(
            values,
            (v, index) => {
                return <LinkifyNewTab key={index}>{v}</LinkifyNewTab>;
            },
        );
        return (
            <DescriptionListGroup key={name}>
                <DescriptionListTerm>{name}</DescriptionListTerm>
                <DescriptionListDescription>
                    <Label
                        isCompact
                        color="cyan"
                        icon={null}
                        variant="filled"
                        isTruncated
                    >
                        {valuesRendered}
                    </Label>
                </DescriptionListDescription>
            </DescriptionListGroup>
        );
    };
    const items: Array<JSX.Element> = [];
    /* result.data is array */
    _.map(result.data, (values, k) => {
        const item = mkItem(k, values);
        items.push(item);
    });
    if (_.isEmpty(items)) {
        return null;
    }
    return (
        <StateDetailsEntry caption="Result data">
            <Flex>
                <FlexItem>
                    <DescriptionList
                        isCompact
                        isHorizontal
                        columnModifier={{
                            default: '2Col',
                        }}
                    >
                        {items}
                    </DescriptionList>
                </FlexItem>
            </Flex>
        </StateDetailsEntry>
    );
};

interface FaceForGreenwaveStateProps {
    state: StateGreenwaveType;
    artifact: Artifact;
    artifactDashboardUrl: string;
}

export const FaceForGreenwaveState: React.FC<FaceForGreenwaveStateProps> = (
    props,
) => {
    const { artifact, state, artifactDashboardUrl } = props;
    const { waiver } = state;
    const isWaived = _.isNumber(waiver?.id);
    const isGatingResult = _.isString(state.requirement?.testcase);
    const labels: JSX.Element[] = [];
    if (isGatingResult) {
        labels.push(
            <Label
                color="blue"
                isCompact
                key="required"
                icon={<RegisteredIcon />}
            >
                required for gating
            </Label>,
        );
    }
    if (isWaived) {
        labels.push(
            <Label color="red" isCompact key="waived" icon={<WeeblyIcon />}>
                waived
            </Label>,
        );
    }
    const iconName: string = _.get(
        state,
        'requirement.type',
        _.get(state, 'result.outcome', 'unknown'),
    ).toLocaleLowerCase();
    const element = (
        <Flex>
            <Flex flex={{ default: 'flex_1' }}>
                <FlexItem>{renderStatusIcon(iconName)}</FlexItem>
                <Flex flexWrap={{ default: 'nowrap' }}>
                    <TextContent>
                        <Text>{state.testcase}</Text>
                    </TextContent>
                </Flex>
                <Flex>
                    <FlexItem>{labels}</FlexItem>
                </Flex>
            </Flex>
            <Flex flex={{ default: 'flex_1' }}>
                <Flex>
                    <GreenwaveStateActions state={state} artifact={artifact} />
                </Flex>
                <Flex>
                    <StateLink
                        state={state}
                        artifactDashboardUrl={artifactDashboardUrl}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
    return element;
};

export interface ArtifactGreenwaveStateProps extends ArtifactStateProps {
    state: StateGreenwaveType;
}

export const ArtifactGreenwaveState: React.FC<ArtifactGreenwaveStateProps> = (
    props,
) => {
    const {
        state,
        artifact,
        forceExpand,
        setExpandedResult,
        artifactDashboardUrl,
    } = props;

    const { testcase } = state;
    /*
     * Expand a specific testcase according to query string and scroll to it
     * ?focus=tc:<test-case-name> or ?focus=id:<pipeline-id>
     */
    const onToggle = () => {
        setExpandedResult(forceExpand ? '' : testcase);
    };
    /** Note for info test results */
    const resultClasses = classnames(styles['helpSelect'], styles['level2']);
    const toRender = (
        <DataListItem
            key={testcase}
            isExpanded={forceExpand}
            className={resultClasses}
            aria-labelledby="artifact-item-result"
        >
            <DataListItemRow>
                <DataListToggle
                    id="toggle"
                    onClick={onToggle}
                    isExpanded={forceExpand}
                />
                <DataListItemCells
                    className="pf-u-m-0 pf-u-p-0"
                    dataListCells={[
                        <DataListCell
                            className="pf-u-m-0 pf-u-p-0"
                            key="secondary content"
                        >
                            <FaceForGreenwaveState
                                state={state}
                                artifact={artifact}
                                artifactDashboardUrl={artifactDashboardUrl}
                            />
                        </DataListCell>,
                    ]}
                />
            </DataListItemRow>
            <DataListContent
                aria-label="Primary Content Result Details"
                id="ex-result-expand1"
                isHidden={!forceExpand}
            >
                {forceExpand && (
                    <>
                        <GreenwaveResultInfo state={state} />
                        <GreenwaveWaiver state={state} />
                        <GreenwaveResultData state={state} />
                        <GreenwaveRequirement state={state} />
                    </>
                )}
            </DataListContent>
        </DataListItem>
    );

    return toRender;
};
