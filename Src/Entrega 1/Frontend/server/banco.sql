use trocaticket;
create table usuario (
    id_usuario int auto_increment primary key,
    nome varchar(150) not null,
    email varchar(150) not null unique,
    senha varchar(255) not null,
    perfil enum('organizador', 'fornecedor', 'administrador') not null,
    data_criacao timestamp default current_timestamp
)ENGINE=INNODB;
create table organizador (
    id_organizador int primary key,
    nome_organizacao varchar(150) not null,
    cnpj varchar(18) unique not null,
    status_aprovacao enum('pendente', 'aprovado', 'rejeitado') not null default 'pendente',
    constraint fk_organizador_usuario foreign key (id_organizador) references usuario(id_usuario) on delete cascade
) engine=innodb;
create table fornecedor (
    id_fornecedor int primary key,
    nome_organizacao varchar(150) not null,
    cnpj varchar(18) unique not null,
    area_atuacao varchar(80) not null,
    status_aprovacao enum('pendente', 'aprovado', 'rejeitado') not null default 'pendente',
    constraint fk_fornecedor_usuario foreign key (id_fornecedor) references usuario(id_usuario) on delete cascade
)ENGINE=INNODB;
create table administrador (
    id_administrador int primary key,
    nivel_permissao enum('suporte', 'gestor', 'master') not null default 'suporte',
    constraint fk_administrador_usuario foreign key (id_administrador) references usuario(id_usuario) on delete cascade
)ENGINE=INNODB;
create table evento (
    id_evento int auto_increment primary key,
    id_organizador_fk int not null,
    titulo_evento varchar(150) not null,
    data_inicio date not null,
    data_fim date not null,
    endereco varchar(200) not null,
    publico_minimo int,
    publico_maximo int,
    status_publicacao enum('rascunho', 'publicado', 'encerrado', 'cancelado') not null default 'rascunho',
    margem_lucro_percentual decimal(5,2) default 0.00,
    ticket_estimado decimal(10,2),
    created_at timestamp default current_timestamp,
    constraint fk_evento_organizador foreign key (id_organizador_fk) references organizador(id_organizador) on delete cascade,
    constraint chk_datas_evento check (data_fim >= data_inicio)
)ENGINE=INNODB;
create table itemcusto (
    id_item_custo int auto_increment primary key,
    id_evento_fk int not null,
    categoria varchar(80) not null,
    descricao_detalhada varchar(255) not null,
    quantidade int not null default 1,
    constraint fk_itemcusto_evento foreign key (id_evento_fk) references evento(id_evento) on delete cascade
)ENGINE=INNODB;
create table custoindependente (
    id_custo_independente int auto_increment primary key,
    id_evento_fk int not null,
    tipo_custo varchar(80) not null,
    descricao varchar(255),
    valor decimal(12,2) not null,
    constraint fk_custoindependente_evento foreign key (id_evento_fk) references evento(id_evento) on delete cascade
)ENGINE=INNODB;
create table proposta (
    id_proposta int auto_increment primary key,
    id_fornecedor_fk int not null,
    id_item_custo_fk int not null,
    valor_oferecido decimal(12,2) not null,
    descricao_proposta text,
    data_validade date,
    observacoes text,
    status_proposta enum('enviada', 'em_analise', 'selecionada', 'recusada') not null default 'enviada',
    data_envio timestamp default current_timestamp,
    constraint fk_proposta_fornecedor foreign key (id_fornecedor_fk) references fornecedor(id_fornecedor) on delete cascade,
    constraint fk_proposta_itemcusto foreign key (id_item_custo_fk) references itemcusto(id_item_custo) on delete cascade,
    constraint uq_fornecedor_item unique (id_fornecedor_fk, id_item_custo_fk)
)ENGINE=INNODB;