import {SiGNMove} from "alg"

import {debugLog} from "./debug"
import {giiKERi3Config, GiiKERi3Cube} from "./giiker"

/******** BluetoothPuzzle ********/

// TODO: Use actual `CustomEvent`s?
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
export class MoveEvent {
  latestMove: SiGNMove;
  timeStamp: number;
  debug?: Object;
}

// TODO: Expose device name (and/or globally unique identifier)?
export abstract class BluetoothPuzzle {
  protected listeners: ((e: MoveEvent) => void)[] = []; // TODO: type

  public abstract name(): string | undefined;

  public addMoveListener(listener: (e: MoveEvent) => void): void {
    this.listeners.push(listener);
  }

  protected dispatchMove(moveEvent: MoveEvent): void {
    for (var l of this.listeners) {
      l(moveEvent);
    }
  }
}

/******** requestOptions ********/

export type BluetoothConfig = {
  filter: BluetoothRequestDeviceFilter
  optionalServices: Array<BluetoothServiceUUID>
}

function requestOptions(): RequestDeviceOptions {
  const requestOptions = {
    filters: <Array<BluetoothRequestDeviceFilter>>[],
    optionalServices: <Array<BluetoothServiceUUID>>[]
  };
  for (var config of [
    giiKERi3Config
  ]) {
    requestOptions.filters.push(config.filter);
    requestOptions.optionalServices = requestOptions.optionalServices.concat(config.optionalServices);
  }
  debugLog({requestOptions});
  return requestOptions;
};

/******** connect() ********/

  // TODO: Debug options to allow connecting to any device?
export async function connect(): Promise<BluetoothPuzzle> {
  debugLog("Attempting to pair.")
  const device = await navigator.bluetooth.requestDevice(requestOptions());
  debugLog("Device:", device);

  if (typeof device.gatt === "undefined") {
    return Promise.reject("Device did not have a GATT server.");
  }

  const server = await device.gatt.connect();
  debugLog("Server:", server);

  // TODO: Detect GiiKERi3Cube instead of assuming.
  return await GiiKERi3Cube.connect(server);
}
