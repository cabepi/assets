
import { sql } from "@vercel/postgres";
import { config } from 'dotenv';

config({ path: '.env.local' });

const usersData = [
    { code: '10359', name: 'Luis Manuel Cruz Hernández', doc: '402-2998346-1', email: 'lcruz@unipago.com.do', costCenter: '2-1-1', account: '62113' },
    { code: '10310', name: 'Carolina Zapata Cruz de Carmona', doc: '223-0058401-2', email: 'czapata@unipago.com.do', costCenter: '2-1-1', account: '62113' },
    { code: '10003', name: 'Carmen Josefina Turbides Eusebio', doc: '001-1022980-4', email: 'cturbides@unipago.com.do', costCenter: '2-1-1', account: '62113' },
    { code: '10239', name: 'Rocío  Vargas Vargas', doc: '056-0164713-3', email: 'rvargas@unipago.com.do', costCenter: '2-1-1', account: '62113' },
    { code: '10237', name: 'Franklin Ernesto Vólquez Mercedes', doc: '018-0049039-1', email: 'fvolquez@unipago.com.do', costCenter: '2-1-1', account: '62113' },
    { code: '10386', name: 'Cenia Yamil Cid Peña', doc: '001-0996212-6', email: 'ccid@unipago.com.do', costCenter: '2-1-1', account: '62113' },
    { code: '10236', name: 'Claudia Patricia Andújar Haché', doc: '001-1844453-8', email: 'candujar@unipago.com.do', costCenter: '2-1-1', account: '62113' },
    { code: '10172', name: 'Lucas  Gaitán Leal', doc: '001-1770886-7', email: 'lgaitan@unipago.com.do', costCenter: '2-1-1', account: '62113' },
    { code: '10015', name: 'Teodoro Junior González Peña', doc: '001-1383689-4', email: 'tgonzalez@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10115', name: 'Benito  Adames Suero', doc: '001-1840172-8', email: 'badames@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10353', name: 'Jhomer  Somon Fulcar', doc: '402-0046222-0', email: 'jsomon@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10354', name: 'Victor Enghert Díaz  Green', doc: '402-2226929-8', email: 'vdiaz@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10396', name: 'Nelson   Elvin Elliot Santana  Fernandez', doc: '001-1522102-0', email: 'nsantana@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10265', name: 'Yudelka Altagracia Roberts Carrero', doc: '001-0906242-2', email: 'yroberts@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10209', name: 'Francisco Alberto Mateo Medina', doc: '001-1800024-9', email: 'frmateo@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10318', name: 'Luis Rafael Herrera Estévez', doc: '001-1629822-5', email: 'lherrera@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10211', name: 'Johanna Miguelina Rojas González', doc: '001-1514578-1', email: 'jrojas@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10411', name: 'Madeline Katherine Soto Santos', doc: '001-1950854-7', email: 'msoto@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10182', name: 'Jhomary Eulogia Serrano Genao', doc: '059-0014497-2', email: 'jserrano@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10242', name: 'Engels Daviel Santos De Mesa', doc: '402-1218573-6', email: 'ensantos@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10397', name: 'Lisa  Betzaida  Moya  Santos', doc: '402-2422614-8', email: 'lmoya@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10362', name: 'Dannerys Mercedes Núñez Leonardo de Montes', doc: '402-2358466-1', email: 'dnunez@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10002', name: 'Constancio  Bocio Casanova', doc: '001-1496500-7', email: 'cbocio@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10346', name: 'Esther Ruth Estrella  Cabral ', doc: '402-2566666-4', email: 'eestrella@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10049', name: 'Yomaris Altagracia Rodríguez Coste de Pichardo', doc: '050-0036573-3', email: 'yrodriguez@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10248', name: 'Cristina  Silfa Montero', doc: '223-0109179-3', email: 'csilfa@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10192', name: 'Cándida Luz Hernández Santana', doc: '001-0809085-3', email: 'cahernandez@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10054', name: 'Carmen Cecilia Quiñones Amparo', doc: '223-0043516-5', email: 'cquinones@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10288', name: 'Angel  García Sánchez', doc: '402-1155101-1', email: 'angarcia@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10256', name: 'Emmy Josefina Ramírez Pichardo', doc: '402-2501684-5', email: 'emramirez@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10364', name: 'Tandry Alfonsina Leguen ', doc: '402-1015067-4', email: 'tleguen@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10375', name: 'Carlos  Pinales Garcia', doc: '402-3026709-4', email: 'cpinales@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10394', name: 'Laidy  Xiomara  Contreras  Neris', doc: '001-1855188-6', email: 'lcontreras@unipago.com.do', costCenter: '3-1-1', account: '62113' },
    { code: '10355', name: 'Yeicol José Camacho Calderon', doc: '402-2945294-7', email: 'ycamacho@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10201', name: 'Dilena  Sánchez Paniagua', doc: '001-0853898-4', email: 'dsanchez@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10409', name: 'Iván Geronny  Sánchez  Mancebo', doc: '402-1907659-9', email: 'isanchez@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10170', name: 'Raymund Johan M. Mejía Mercedes', doc: '025-0046940-4', email: 'ramejia@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10378', name: 'Harold  Morillo Pichardo', doc: '402-1999201-9', email: 'hmorillo@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10244', name: 'José Armando Suarez Molina', doc: '402-3128170-6', email: 'jsuarez@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10307', name: 'Andrómedis  Beltré Cedeño', doc: '002-0130774-1', email: 'abeltre@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10228', name: 'Juan Miguel Tavarez Mateo', doc: '402-2456853-1', email: 'jtavarez@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10367', name: 'Yohanna  Diaz Florian', doc: '402-1210244-2', email: 'ydiaz@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10241', name: 'Ismael Enrique Paredes Amparo', doc: '402-1029304-5', email: 'iparedes@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10073', name: 'Gabriel De Jesús Marmolejos Estrella', doc: '001-1773143-0', email: 'gmarmolejos@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10319', name: 'Miguel Antonio De La Cruz Cleto', doc: '402-1480997-8', email: 'mdelacruz@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10034', name: 'Francisco Javier Guillermo Castillo', doc: '001-1146980-5', email: 'fguillermo@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10374', name: 'Franklyn D Los Angeles Brea Guzman', doc: '402-1402401-6', email: 'fbrea@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10234', name: 'Jadison Enmanuel Abreu Belvere', doc: '225-0085420-7', email: 'jabreu@unipago.com.do', costCenter: '4-1-1', account: '52113' },
    { code: '10320', name: 'Isaac Enmanuel Avelino Cabrera', doc: '402-2590817-3', email: 'iavelino@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10398', name: 'Alam   Gómez  Tapia', doc: '223-0168944-8', email: 'agomez@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10343', name: 'Alexander  Rodríguez Peña', doc: '402-1915904-9', email: 'arodriguez@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10061', name: 'Gerson Leonardo Lamarche López', doc: '001-1762327-2', email: 'glamarche@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10300', name: 'Tulio Manuel Mercedes Diloné', doc: '018-0059551-2', email: 'tmercedes@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10336', name: 'Wilber Rubinskin Flores Bonifacio', doc: '402-2291633-6', email: 'wflores@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10351', name: 'Jorge Luis Almanzar Valenzuela', doc: '402-3019510-5', email: 'jlalmanzar@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10339', name: 'Gabriel Antonio Pérez De Los Santos', doc: '402-4040306-9', email: 'gaperez@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10076', name: 'Ramón Elías Rodríguez De La Rosa', doc: '001-1602120-5', email: 'rerodriguez@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10184', name: 'Francis Marcos Maríñez Maríñez', doc: '001-0181486-1', email: 'fmarinez@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10330', name: 'Amy Alexandra Martínez Mercedes', doc: '402-1240244-6', email: 'ammartinez@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10162', name: 'Abel Abraham Feliz Soto', doc: '402-2444220-8', email: 'afeliz@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10392', name: 'Luis  Miguel  Caraballo  De los Santos', doc: '402-3095111-9', email: 'lcaraballo@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10410', name: 'Eulise Mauricio Matías Martínez', doc: '402-0991283-7', email: 'ematias@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10335', name: 'Elvin Daniel Guzmán Díaz', doc: '402-3472364-7', email: 'eguzman@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10301', name: 'Raysom  Almánzar Ortega', doc: '402-2535172-1', email: 'ralmanzar@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10368', name: 'Esdra Nehemias Encarnación Ramírez', doc: '402-3106611-5', email: 'eencarnacion@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10161', name: 'Carlos Andrés Betancur Pineda', doc: '402-3829542-8', email: 'cbetancur@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10349', name: 'Samuel  Páez Pérez', doc: '402-2391508-9', email: 'spaez@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10289', name: 'Gina Inmaculada Ogando Frómeta', doc: '402-2214525-8', email: 'gogando@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10298', name: 'Damián  Evangelista De La Rosa', doc: '153-0001346-1', email: 'devangelista@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10360', name: 'Gerson  Santos Mateo', doc: '402-2581056-9', email: 'gsantos@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10412', name: 'Shumacker Antonio Del Villar Lorenzo', doc: '402-3066205-4', email: 'shumackerlorenzo@gmail.com', costCenter: '5-1-1', account: '52113' },
    { code: '10414', name: 'Marcos Antonio Montero Jiménez', doc: '402-2674211-8', email: 'Marcosantonio.mamj@gmail.com', costCenter: '5-1-1', account: '52113' },
    { code: '10333', name: 'Jerermy Michel Solano Frías', doc: '402-3149330-1', email: 'jsolano@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10413', name: 'Aldo Narciso Rodríguez Rodríguez', doc: '001-1331283-9', email: 'al2.rodri@gmail.com', costCenter: '5-1-1', account: '52113' },
    { code: '10175', name: 'América Elizabeth Montilla Del Rosario', doc: '026-0111114-5', email: 'amontilla@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10231', name: 'Francisco Alberto Gil Tavárez', doc: '001-1864552-2', email: 'fgil@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10068', name: 'Andrea  González Contreras', doc: '087-0017342-3', email: 'agonzalez@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10305', name: 'Sadia María Cuello De Los Santos', doc: '402-1369005-6', email: 'scuello@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10233', name: 'Jeferson Alexander Bernabel Cuevas', doc: '402-2953883-6', email: 'jbernabel@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10334', name: 'Alejandro  Cortorreal Rosario', doc: '402-2192323-4', email: 'acortorreal@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10340', name: 'Samuel Estarlin Vilorio Araujo', doc: '001-1935057-7', email: 'svilorio@unipago.com.do', costCenter: '5-1-1', account: '52113' },
    { code: '10371', name: 'Geraldo Esteban Perez Alix', doc: '402-1538836-0', email: 'geperez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10293', name: 'Anuard Juan Pablo Michelén Ramírez', doc: '402-2117962-1', email: 'anmichelen@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10067', name: 'Luis Felipe Amaro Lithgow', doc: '001-1472273-9', email: 'lamaro@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10011', name: 'Jennifer  Calcaño Hernández', doc: '001-1340918-9', email: 'jcalcano@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10381', name: 'Rode Esmeralda Briceño Pérez', doc: '402-2523276-4', email: 'rbriceno@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10326', name: 'Elin  Florentino Beltran', doc: '402-2795829-1', email: 'eflorentino@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10373', name: 'Vanessa  Vallejo Batista', doc: '001-0776272-6', email: 'vvallejo@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10037', name: 'Nadia María Rodríguez Teruel', doc: '001-1339157-7', email: 'nrodriguez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10166', name: 'Gloury Yokaira Piñeyro Beltre', doc: '225-0061075-7', email: 'gpineyro@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10356', name: 'Ángel Samuel Parra Hernández', doc: '001-1688057-6', email: 'aparra@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10296', name: 'Hipólito López Guzmán ', doc: '001-1220555-4', email: 'hlopez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10294', name: 'Joel  Arias De La Cruz', doc: '402-4335112-5', email: 'jarias@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10138', name: 'Juan Gabriel Castillo Reyes', doc: '140-0003318-4', email: 'jcastillo@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10238', name: 'Sonia  Tellería Fernández', doc: '001-1850372-1', email: 'stelleria@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10240', name: 'Marcos Orandy Pérez Perez', doc: '402-2016034-1', email: 'maperez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10028', name: 'Miguel Ángel Ramírez Sosa', doc: '001-1480029-5', email: 'mramirez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10271', name: 'Erickson  Suero Villanueva', doc: '001-1726024-0', email: 'esuero@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10030', name: 'Sandy  Ramírez Mateo', doc: '001-0369048-3', email: 'sramirez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10369', name: 'Carmen Mabely Hernández García', doc: '224-0013485-8', email: 'cmhernandez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10370', name: 'Carlos Alfredo Gutierrez Peña', doc: '031-0420552-5', email: 'cgutierrez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10165', name: 'Audris  Paulino Genao', doc: '223-0109669-3', email: 'aupaulino@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10038', name: 'Yudelka  Velázquez Núñez', doc: '087-0014586-8', email: 'yvelasquez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10210', name: 'Wendy Estefany García Suero', doc: '229-0014628-7', email: 'wgarcia@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10039', name: 'Miguel Ángel Mejía Ruíz', doc: '001-1561412-5', email: 'mmejia@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10153', name: 'Guillermo Miguel Prenza Guzmán', doc: '225-0039198-6', email: 'gprenza@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10008', name: 'Josué  Ferreras Gómez', doc: '001-1444137-1', email: 'jferreras@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10269', name: 'Enmanuel  Batista Castillo', doc: '402-1005782-0', email: 'ebatista@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10329', name: 'Purina  Hidalgo De Santiago', doc: '001-1923154-6', email: 'puhidalgo@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10029', name: 'Rosa Carolina Rodríguez Rodríguez', doc: '053-0031779-8', email: 'rrodriguez@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10226', name: 'José Eduardo De León Suarez', doc: '223-0167778-1', email: 'jedeleon@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10358', name: 'Darfry  Contreras Aybar', doc: '402-3835473-8', email: 'dcontreras@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10173', name: 'José Joaquín Payano Tejada', doc: '001-1320723-7', email: 'jpayano@unipago.com.do', costCenter: '6-1-1', account: '62113' },
    { code: '10266', name: 'Oscar José Alcántara Lapaix', doc: '012-0119154-9', email: 'oalcantara@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10272', name: 'Arilyn Teresa Jiménez Andújar', doc: '047-0165070-9', email: 'arjimenez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10382', name: 'Alexandra  Gabriela Alecon Santana', doc: '402-2068599-0', email: 'aalecon@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10415', name: 'Juan Alberto Adames Canario', doc: '402-3927824-1', email: 'jadames@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10262', name: 'Irogrenchi Maricris González ', doc: '001-1137540-8', email: 'mgonzalez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10347', name: 'Ana Luisa  Fernández Paulino', doc: '402-2407660-0', email: 'afernandez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10379', name: 'Henderson Manuel Diaz Castillo', doc: '068-0054576-3', email: 'hdiaz@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10261', name: 'Karla Gabriela González Bourtokan', doc: '001-1833320-2', email: 'kgonzalez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10071', name: 'Gina Isabel Peña Dorado', doc: '003-0096446-7', email: 'gpena@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10225', name: 'Isabel  Santana González', doc: '001-1107997-6', email: 'isantana@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10284', name: 'Digna Yadira Hernández Reyes', doc: '223-0062800-9', email: 'dhernandez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10361', name: 'Bianca Michelle Mariñez Rodríguez', doc: '402-1486183-9', email: 'bmarinez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10325', name: 'Lanhya Isabel Suriel Rodríguez', doc: '001-1674908-6', email: 'lsuriel@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10385', name: 'Heidy  Almonte Franco', doc: '402-2210533-6', email: 'halmonte@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10270', name: 'Kelvin  Encarnación Ureña', doc: '402-3474909-7', email: 'kencarnacion@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10345', name: 'Leticia Cristina Meléndez Taveras', doc: '402-0069996-1', email: 'lmelendez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10286', name: 'Luciano  Omar De Jesús Gómez Mercado', doc: '031-0110489-5', email: 'lgomez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10275', name: 'Paula Elisa García Landa', doc: '402-0057566-6', email: 'pgarcia@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10276', name: 'Juan Pablo Alonso Teijeiro', doc: '001-1840197-5', email: 'jalonso@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10250', name: 'Yira Vanessa Hernández De Moya', doc: '001-1380158-3', email: 'yhernandez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10328', name: 'Frank Adderliz Estévez ', doc: '031-0535367-0', email: 'festevez@unipago.com.do', costCenter: '8-1-1', account: '52113' },
    { code: '10372', name: 'Yina Argentina Cordero Pujals de Duluc', doc: '001-0913769-5', email: 'gcordero@unipago.com.do', costCenter: '8-1-1', account: '52113' }
];

async function updateUsers() {
    console.log('Starting user update (Adding full_name)...');

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of usersData) {
        try {
            const documentNumber = user.doc.replace(/-/g, '');
            const costCenter = user.costCenter.replace(/-/g, '');

            const result = await sql`
                UPDATE asset.users
                SET 
                    full_name = ${user.name},
                    employee_code = ${user.code},
                    document_number = ${documentNumber},
                    cost_center = ${costCenter},
                    accounting_account = ${user.account}
                WHERE email = ${user.email}
            `;

            if (result.rowCount && result.rowCount > 0) {
                updatedCount++;
            }
        } catch (error) {
            console.error(`Error updating user ${user.email}:`, error);
            errorCount++;
        }
    }

    console.log(`✅ Update complete. Updated: ${updatedCount}, Errors: ${errorCount}`);
}

updateUsers();
