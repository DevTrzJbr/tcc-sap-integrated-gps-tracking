namespace my.transportes;

using {
  cuid,
  managed
} from '@sap/cds/common';

entity Transporte : cuid, managed {
      key ID : Integer;
      @assert.unique
      placa  : String;
      marca  : String;
      modelo : String;
}
