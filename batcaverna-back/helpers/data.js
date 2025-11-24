function getDiaSemana(date) {
    // 0–6: domingo–sábado
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias[date.getDay()];
}

export function gerarDias(inicio, fim) {


    const start = new Date(inicio+' 00:00:00');
    const end = new Date(fim+' 00:00:00');
    //console.log(`${inicio} - ${fim}`);

    // Zera hora para evitar problemas de timezone
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const dias = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {

        const diaSemana = d.getDay();
        // 0 = Domingo
        // 1 = Segunda
        // 2 = Terça
        // 3 = Quarta
        // 4 = Quinta
        // 5 = Sexta
        // 6 = Sábado

        // Mantém apenas segunda a sexta
        if (diaSemana >= 1 && diaSemana <= 5) {
            dias.push({
                data: new Date(d),
                dia: getDiaSemana(d),
            });
        }
    }

    return dias;

}

export function interpretarHorarios(codigo) {
    const mapaDias = {
        2: "Seg",
        3: "Ter",
        4: "Qua",
        5: "Qui",
        6: "Sex"
    };

    const mapaTurno = {
        M: 0,
        T: 1,
        N: 2
    };

    const blocos = codigo.split('/').map(b => b.trim());
    const resultado = [];

    blocos.forEach(bloco => {
        // Identificar o turno
        const turnoChar = bloco.match(/[MTN]/i)[0].toUpperCase();

        // Separar dia(s) e horário(s)
        const partes = bloco.split(turnoChar);
        const diasStr = partes[0];
        const horariosStr = partes[1];

        const turno = mapaTurno[turnoChar];
        const horarios = horariosStr.split("").map(n => Number(n));

        // Para cada dia
        diasStr.split("").forEach(diaChar => {
            const dia = mapaDias[diaChar];

            // Para cada horário → cria um objeto separado
            horarios.forEach(horario => {
                resultado.push({
                    dia,
                    turno,
                    horario
                });
            });
        });
    });

    return resultado;
}

