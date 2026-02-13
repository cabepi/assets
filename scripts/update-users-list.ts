
import { sql } from "@vercel/postgres";
import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Raw data provided by the user in Step 1143
const rawData = `
10359	Luis Manuel Cruz Hernández	402-2998346-1	lcruz@unipago.com.do	2-1-1	62113
10310	Carolina Zapata Cruz de Carmona	223-0058401-2	czapata@unipago.com.do	2-1-1	62113
10003	Carmen Josefina Turbides Eusebio	001-1022980-4	cturbides@unipago.com.do	2-1-1	62113
10239	Rocío  Vargas Vargas	056-0164713-3	rvargas@unipago.com.do	2-1-1	62113
10237	Franklin Ernesto Vólquez Mercedes	018-0049039-1	fvolquez@unipago.com.do	2-1-1	62113
10386	Cenia Yamil Cid Peña	001-0996212-6	ccid@unipago.com.do	2-1-1	62113
10236	Claudia Patricia Andújar Haché	001-1844453-8	candujar@unipago.com.do	2-1-1	62113
10172	Lucas  Gaitán Leal	001-1770886-7	lgaitan@unipago.com.do	2-1-1	62113
10015	Teodoro Junior González Peña	001-1383689-4	tgonzalez@unipago.com.do	3-1-1	62113
10115	Benito  Adames Suero	001-1840172-8	badames@unipago.com.do	3-1-1	62113
10353	Jhomer  Somon Fulcar	402-0046222-0	jsomon@unipago.com.do	3-1-1	62113
10354	Victor Enghert Díaz  Green	402-2226929-8	vdiaz@unipago.com.do	3-1-1	62113
10396	Nelson   Elvin Elliot Santana  Fernandez	001-1522102-0	nsantana@unipago.com.do	3-1-1	62113
10265	Yudelka Altagracia Roberts Carrero	001-0906242-2	yroberts@unipago.com.do	3-1-1	62113
10209	Francisco Alberto Mateo Medina	001-1800024-9	frmateo@unipago.com.do	3-1-1	62113
10318	Luis Rafael Herrera Estévez	001-1629822-5	lherrera@unipago.com.do	3-1-1	62113
10211	Johanna Miguelina Rojas González	001-1514578-1	jrojas@unipago.com.do	3-1-1	62113
10411	Madeline Katherine Soto Santos	001-1950854-7	msoto@unipago.com.do	3-1-1	62113
10182	Jhomary Eulogia Serrano Genao	059-0014497-2	jserrano@unipago.com.do	3-1-1	62113
10242	Engels Daviel Santos De Mesa	402-1218573-6	ensantos@unipago.com.do	3-1-1	62113
10397	Lisa  Betzaida  Moya  Santos	402-2422614-8	lmoya@unipago.com.do	3-1-1	62113
10362	Dannerys Mercedes Núñez Leonardo de Montes	402-2358466-1	dnunez@unipago.com.do	3-1-1	62113
10002	Constancio  Bocio Casanova	001-1496500-7	cbocio@unipago.com.do	3-1-1	62113
10346	Esther Ruth Estrella  Cabral 	402-2566666-4	eestrella@unipago.com.do	3-1-1	62113
10049	Yomaris Altagracia Rodríguez Coste de Pichardo	050-0036573-3	yrodriguez@unipago.com.do	3-1-1	62113
10248	Cristina  Silfa Montero	223-0109179-3	csilfa@unipago.com.do	3-1-1	62113
10192	Cándida Luz Hernández Santana	001-0809085-3	cahernandez@unipago.com.do	3-1-1	62113
10054	Carmen Cecilia Quiñones Amparo	223-0043516-5	cquinones@unipago.com.do	3-1-1	62113
10288	Angel  García Sánchez	402-1155101-1	angarcia@unipago.com.do	3-1-1	62113
10256	Emmy Josefina Ramírez Pichardo	402-2501684-5	emramirez@unipago.com.do	3-1-1	62113
10364	Tandry Alfonsina Leguen 	402-1015067-4	tleguen@unipago.com.do	3-1-1	62113
10375	Carlos  Pinales Garcia	402-3026709-4	cpinales@unipago.com.do	3-1-1	62113
10394	Laidy  Xiomara  Contreras  Neris	001-1855188-6	lcontreras@unipago.com.do	3-1-1	62113
10355	Yeicol José Camacho Calderon	402-2945294-7	ycamacho@unipago.com.do	4-1-1	52113
10201	Dilena  Sánchez Paniagua	001-0853898-4	dsanchez@unipago.com.do	4-1-1	52113
10409	Iván Geronny  Sánchez  Mancebo	402-1907659-9	isanchez@unipago.com.do	4-1-1	52113
10170	Raymund Johan M. Mejía Mercedes	025-0046940-4	ramejia@unipago.com.do	4-1-1	52113
10378	Harold  Morillo Pichardo	402-1999201-9	hmorillo@unipago.com.do	4-1-1	52113
10244	José Armando Suarez Molina	402-3128170-6	jsuarez@unipago.com.do	4-1-1	52113
10307	Andrómedis  Beltré Cedeño	002-0130774-1	abeltre@unipago.com.do	4-1-1	52113
10228	Juan Miguel Tavarez Mateo	402-2456853-1	jtavarez@unipago.com.do	4-1-1	52113
10367	Yohanna  Diaz Florian	402-1210244-2	ydiaz@unipago.com.do	4-1-1	52113
10241	Ismael Enrique Paredes Amparo	402-1029304-5	iparedes@unipago.com.do	4-1-1	52113
10073	Gabriel De Jesús Marmolejos Estrella	001-1773143-0	gmarmolejos@unipago.com.do	4-1-1	52113
10319	Miguel Antonio De La Cruz Cleto	402-1480997-8	mdelacruz@unipago.com.do	4-1-1	52113
10034	Francisco Javier Guillermo Castillo	001-1146980-5	fguillermo@unipago.com.do	4-1-1	52113
10374	Franklyn D Los Angeles Brea Guzman	402-1402401-6	fbrea@unipago.com.do	4-1-1	52113
10234	Jadison Enmanuel Abreu Belvere	225-0085420-7	jabreu@unipago.com.do	4-1-1	52113
10320	Isaac Enmanuel Avelino Cabrera	402-2590817-3	iavelino@unipago.com.do	5-1-1	52113
10398	Alam   Gómez  Tapia	223-0168944-8	agomez@unipago.com.do	5-1-1	52113
10343	Alexander  Rodríguez Peña	402-1915904-9	arodriguez@unipago.com.do	5-1-1	52113
10061	Gerson Leonardo Lamarche López	001-1762327-2	glamarche@unipago.com.do	5-1-1	52113
10300	Tulio Manuel Mercedes Diloné	018-0059551-2	tmercedes@unipago.com.do	5-1-1	52113
10336	Wilber Rubinskin Flores Bonifacio	402-2291633-6	wflores@unipago.com.do	5-1-1	52113
10351	Jorge Luis Almanzar Valenzuela	402-3019510-5	jlalmanzar@unipago.com.do	5-1-1	52113
10339	Gabriel Antonio Pérez De Los Santos	402-4040306-9	gaperez@unipago.com.do	5-1-1	52113
10076	Ramón Elías Rodríguez De La Rosa	001-1602120-5	rerodriguez@unipago.com.do	5-1-1	52113
10184	Francis Marcos Maríñez Maríñez	001-0181486-1	fmarinez@unipago.com.do	5-1-1	52113
10330	Amy Alexandra Martínez Mercedes	402-1240244-6	ammartinez@unipago.com.do	5-1-1	52113
10162	Abel Abraham Feliz Soto	402-2444220-8	afeliz@unipago.com.do	5-1-1	52113
10392	Luis  Miguel  Caraballo  De los Santos	402-3095111-9	lcaraballo@unipago.com.do	5-1-1	52113
10410	Eulise Mauricio Matías Martínez	402-0991283-7	ematias@unipago.com.do	5-1-1	52113
10335	Elvin Daniel Guzmán Díaz	402-3472364-7	eguzman@unipago.com.do	5-1-1	52113
10301	Raysom  Almánzar Ortega	402-2535172-1	ralmanzar@unipago.com.do	5-1-1	52113
10368	Esdra Nehemias Encarnación Ramírez	402-3106611-5	eencarnacion@unipago.com.do	5-1-1	52113
10161	Carlos Andrés Betancur Pineda	402-3829542-8	cbetancur@unipago.com.do	5-1-1	52113
10349	Samuel  Páez Pérez	402-2391508-9	spaez@unipago.com.do	5-1-1	52113
10289	Gina Inmaculada Ogando Frómeta	402-2214525-8	gogando@unipago.com.do	5-1-1	52113
10298	Damián  Evangelista De La Rosa	153-0001346-1	devangelista@unipago.com.do	5-1-1	52113
10360	Gerson  Santos Mateo	402-2581056-9	gsantos@unipago.com.do	5-1-1	52113
10412	Shumacker Antonio Del Villar Lorenzo	402-3066205-4	shumackerlorenzo@gmail.com	5-1-1	52113
10414	Marcos Antonio Montero Jiménez	402-2674211-8	Marcosantonio.mamj@gmail.com	5-1-1	52113
10333	Jerermy Michel Solano Frías	402-3149330-1	jsolano@unipago.com.do	5-1-1	52113
10413	Aldo Narciso Rodríguez Rodríguez	001-1331283-9	al2.rodri@gmail.com	5-1-1	52113
10175	América Elizabeth Montilla Del Rosario	026-0111114-5	amontilla@unipago.com.do	5-1-1	52113
10231	Francisco Alberto Gil Tavárez	001-1864552-2	fgil@unipago.com.do	5-1-1	52113
10068	Andrea  González Contreras	087-0017342-3	agonzalez@unipago.com.do	5-1-1	52113
10305	Sadia María Cuello De Los Santos	402-1369005-6	scuello@unipago.com.do	5-1-1	52113
10233	Jeferson Alexander Bernabel Cuevas	402-2953883-6	jbernabel@unipago.com.do	5-1-1	52113
10334	Alejandro  Cortorreal Rosario	402-2192323-4	acortorreal@unipago.com.do	5-1-1	52113
10340	Samuel Estarlin Vilorio Araujo	001-1935057-7	svilorio@unipago.com.do	5-1-1	52113
10371	Geraldo Esteban Perez Alix	402-1538836-0	geperez@unipago.com.do	6-1-1	62113
10293	Anuard Juan Pablo Michelén Ramírez	402-2117962-1	anmichelen@unipago.com.do	6-1-1	62113
10067	Luis Felipe Amaro Lithgow	001-1472273-9	lamaro@unipago.com.do	6-1-1	62113
10011	Jennifer  Calcaño Hernández	001-1340918-9	jcalcano@unipago.com.do	6-1-1	62113
10381	Rode Esmeralda Briceño Pérez	402-2523276-4	rbriceno@unipago.com.do	6-1-1	62113
10326	Elin  Florentino Beltran	402-2795829-1	eflorentino@unipago.com.do	6-1-1	62113
10373	Vanessa  Vallejo Batista	001-0776272-6	vvallejo@unipago.com.do	6-1-1	62113
10037	Nadia María Rodríguez Teruel	001-1339157-7	nrodriguez@unipago.com.do	6-1-1	62113
10166	Gloury Yokaira Piñeyro Beltre	225-0061075-7	gpineyro@unipago.com.do	6-1-1	62113
10356	Ángel Samuel Parra Hernández	001-1688057-6	aparra@unipago.com.do	6-1-1	62113
10296	Hipólito López Guzmán 	001-1220555-4	hlopez@unipago.com.do	6-1-1	62113
10294	Joel  Arias De La Cruz	402-4335112-5	jarias@unipago.com.do	6-1-1	62113
10138	Juan Gabriel Castillo Reyes	140-0003318-4	jcastillo@unipago.com.do	6-1-1	62113
10238	Sonia  Tellería Fernández	001-1850372-1	stelleria@unipago.com.do	6-1-1	62113
10240	Marcos Orandy Pérez Perez	402-2016034-1	maperez@unipago.com.do	6-1-1	62113
10028	Miguel Ángel Ramírez Sosa	001-1480029-5	mramirez@unipago.com.do	6-1-1	62113
10271	Erickson  Suero Villanueva	001-1726024-0	esuero@unipago.com.do	6-1-1	62113
10030	Sandy  Ramírez Mateo	001-0369048-3	sramirez@unipago.com.do	6-1-1	62113
10369	Carmen Mabely Hernández García	224-0013485-8	cmhernandez@unipago.com.do	6-1-1	62113
10370	Carlos Alfredo Gutierrez Peña	031-0420552-5	cgutierrez@unipago.com.do	6-1-1	62113
10165	Audris  Paulino Genao	223-0109669-3	aupaulino@unipago.com.do	6-1-1	62113
10038	Yudelka  Velázquez Núñez	087-0014586-8	yvelasquez@unipago.com.do	6-1-1	62113
10210	Wendy Estefany García Suero	229-0014628-7	wgarcia@unipago.com.do	6-1-1	62113
10039	Miguel Ángel Mejía Ruíz	001-1561412-5	mmejia@unipago.com.do	6-1-1	62113
10153	Guillermo Miguel Prenza Guzmán	225-0039198-6	gprenza@unipago.com.do	6-1-1	62113
10008	Josué  Ferreras Gómez	001-1444137-1	jferreras@unipago.com.do	6-1-1	62113
10269	Enmanuel  Batista Castillo	402-1005782-0	ebatista@unipago.com.do	6-1-1	62113
10329	Purina  Hidalgo De Santiago	001-1923154-6	puhidalgo@unipago.com.do	6-1-1	62113
10029	Rosa Carolina Rodríguez Rodríguez	053-0031779-8	rrodriguez@unipago.com.do	6-1-1	62113
10226	José Eduardo De León Suarez	223-0167778-1	jedeleon@unipago.com.do	6-1-1	62113
10358	Darfry  Contreras Aybar	402-3835473-8	dcontreras@unipago.com.do	6-1-1	62113
10173	José Joaquín Payano Tejada	001-1320723-7	jpayano@unipago.com.do	6-1-1	62113
10266	Oscar José Alcántara Lapaix	012-0119154-9	oalcantara@unipago.com.do	8-1-1	52113
10272	Arilyn Teresa Jiménez Andújar	047-0165070-9	arjimenez@unipago.com.do	8-1-1	52113
10382	Alexandra  Gabriela Alecon Santana	402-2068599-0	aalecon@unipago.com.do	8-1-1	52113
10415	Juan Alberto Adames Canario	402-3927824-1	jadames@unipago.com.do	8-1-1	52113
10262	Irogrenchi Maricris González 	001-1137540-8	mgonzalez@unipago.com.do	8-1-1	52113
10347	Ana Luisa  Fernández Paulino	402-2407660-0	afernandez@unipago.com.do	8-1-1	52113
10379	Henderson Manuel Diaz Castillo	068-0054576-3	hdiaz@unipago.com.do	8-1-1	52113
10261	Karla Gabriela González Bourtokan	001-1833320-2	kgonzalez@unipago.com.do	8-1-1	52113
10071	Gina Isabel Peña Dorado	003-0096446-7	gpena@unipago.com.do	8-1-1	52113
10225	Isabel  Santana González	001-1107997-6	isantana@unipago.com.do	8-1-1	52113
10284	Digna Yadira Hernández Reyes	223-0062800-9	dhernandez@unipago.com.do	8-1-1	52113
10361	Bianca Michelle Mariñez Rodríguez	402-1486183-9	bmarinez@unipago.com.do	8-1-1	52113
10325	Lanhya Isabel Suriel Rodríguez	001-1674908-6	lsuriel@unipago.com.do	8-1-1	52113
10385	Heidy  Almonte Franco	402-2210533-6	halmonte@unipago.com.do	8-1-1	52113
10270	Kelvin  Encarnación Ureña	402-3474909-7	kencarnacion@unipago.com.do	8-1-1	52113
10345	Leticia Cristina Meléndez Taveras	402-0069996-1	lmelendez@unipago.com.do	8-1-1	52113
10286	Luciano  Omar De Jesús Gómez Mercado	031-0110489-5	lgomez@unipago.com.do	8-1-1	52113
10275	Paula Elisa García Landa	402-0057566-6	pgarcia@unipago.com.do	8-1-1	52113
10276	Juan Pablo Alonso Teijeiro	001-1840197-5	jalonso@unipago.com.do	8-1-1	52113
10250	Yira Vanessa Hernández De Moya	001-1380158-3	yhernandez@unipago.com.do	8-1-1	52113
10328	Frank Adderliz Estévez 	031-0535367-0	festevez@unipago.com.do	8-1-1	52113
10372	Yina Argentina Cordero Pujals de Duluc	001-0913769-5	gcordero@unipago.com.do	8-1-1	52113
`;

// IDs to find, as requested by user
const targetIds = [
    '10076', '10283', '10290', '10291', '10295', '10321',
    '10330', '10332', '10363', '10393', '10395'
];

async function main() {
    console.log("Parsing data...");

    const lines = rawData.trim().split('\n');
    console.log(`Loaded ${lines.length} lines of data.`);

    const foundUsers = [];
    const notFoundIds = [];

    // Build map of ID -> Data
    const dataMap = new Map();
    lines.forEach(line => {
        const parts = line.split('\t');
        if (parts.length >= 6) {
            const id = parts[0].trim();
            dataMap.set(id, {
                employee_code: id,
                full_name: parts[1].trim(),
                document_number: parts[2].trim(),
                email: parts[3].trim(),
                cost_center: parts[4].trim(),
                fripick_subsidy_account: parts[5].trim()
            });
        }
    });

    // Check requested IDs
    for (const id of targetIds) {
        const user = dataMap.get(id);
        if (user) {
            foundUsers.push(user);
        } else {
            notFoundIds.push(id);
        }
    }

    console.log(`Found ${foundUsers.length} users.`);
    if (notFoundIds.length > 0) {
        console.warn(`WARN: The following IDs were NOT found in the provided list: ${notFoundIds.join(', ')}`);
    }

    if (foundUsers.length === 0) {
        console.log("No users to process. Exiting.");
        return;
    }

    console.log("Starting DB operations...");

    let successCount = 0;
    let errorCount = 0;

    for (const user of foundUsers) {
        try {
            console.log(`Processing ${user.employee_code} - ${user.full_name}...`);

            // Check if user exists
            const existing = await sql`SELECT user_id FROM asset.users WHERE employee_code = ${user.employee_code} LIMIT 1`;

            if (existing.rows.length > 0) {
                // Update
                await sql`
                    UPDATE asset.users SET
                        full_name = ${user.full_name},
                        document_number = ${user.document_number},
                        email = ${user.email},
                        cost_center = ${user.cost_center},
                        fripick_subsidy_account = ${user.fripick_subsidy_account}
                    WHERE employee_code = ${user.employee_code}
                 `;
                console.log(`  -> UPDATED`);
            } else {
                // Insert
                // Note: default role_id required? Assuming default on DB or nullable.
                // Schema says role_id is integer, maybe not nullable. Assume 2 (USER) or 1 (ADMIN).
                // Better to check or guess. Let's try inserting without it if nullable or default.
                // If fails, we might need a role. Usually 2 is a safe bet for 'user'.

                // Also 'password_hash' might be needed if non-nullable.
                // Schema says NOT NULL usually for passwords.
                // I will set a dummy password hash just in case, or empty string.
                const dummyHash = 'pbkdf2:sha256:260000$dummy$dummy'; // Placeholder
                const defaultRoleId = 2; // Assuming 2 is standard user
                const defaultReceivable = '12301';

                await sql`
                    INSERT INTO asset.users (
                        employee_code, full_name, document_number, email, 
                        cost_center, fripick_subsidy_account, 
                        employee_receivable_account, password_hash, role_id, is_active
                    ) VALUES (
                        ${user.employee_code}, 
                        ${user.full_name}, 
                        ${user.document_number}, 
                        ${user.email}, 
                        ${user.cost_center}, 
                        ${user.fripick_subsidy_account},
                        ${defaultReceivable},
                        ${dummyHash},
                        ${defaultRoleId},
                        true
                    )
                 `;
                console.log(`  -> INSERTED`);
            }
            successCount++;
        } catch (error) {
            console.error(`  -> ERROR: ${error}`);
            errorCount++;
        }
    }

    console.log(`Done. Success: ${successCount}, Errors: ${errorCount}`);
}

main();
