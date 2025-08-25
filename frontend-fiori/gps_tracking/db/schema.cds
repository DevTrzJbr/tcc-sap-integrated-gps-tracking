namespace my.transportes;

using {
  cuid,
  managed
} from '@sap/cds/common';

entity Transporte : cuid, managed {
      placa  : String;
      marca  : String;
      modelo : String;
}
