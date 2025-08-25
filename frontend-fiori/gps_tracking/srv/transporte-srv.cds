using my.transportes as my from '../db/schema';

service TransporteService {
    entity Transporte as projection on my.Transporte;
}
