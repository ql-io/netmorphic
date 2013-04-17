/*
 * Copyright 2013 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Event emitted when an event starts. An event may encompass one or more activities.
 *
 * Events may be nested. Look for the end event to determine when an event ends.
 */
exports.BEGIN_EVENT = 'netmorphic-begin-event';

/**
 * Event emitted when an event ends.
 */
exports.END_EVENT = 'netmorphic-end-event';

/**
 * Event emitted periodically by an instance of the netmorphic server..
 */
exports.HEART_BEAT = 'netmorphic-heart-beat';

/**
 * An event.
 */
exports.EVENT = 'netmorphic-event';

/**
 * Warning event.
 */
exports.WARNING = 'netmorphic-warning';

/**
 * Error event.
 */
exports.ERROR = 'netmorphic-error';

/**
 * Gather request ID for Call tracing
 */
exports.REQUEST_ID_RECEIVED = 'ql-io-request-id-received';

/**
 * debug event
 */
exports.DEBUG = 'netmorphic-debug';

exports.DEBUG_STEP = 'netmorphic-debug-step';

exports.VISUALIZATION = 'netmorphic-visualization';

exports.KILL = 'netmorphic-kill';