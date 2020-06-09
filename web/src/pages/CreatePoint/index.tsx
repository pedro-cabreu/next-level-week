import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link } from "react-router-dom";
import './CreatePoint.css';
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import api from '../../services/api';
import axios from "axios";
import logo from '../../assets/logo.svg';

const CreatePoint = () => {

    interface Item{
        id: number;
        name: string;
        image_url: string;
    }

    interface ufResponse{
        sigla: string;
    }

    interface cityResponse{
        nome: string;
    }

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([])
    const[selectedUf, setSelectedUf] = useState('0');
    const[selectedItems, setSelectedItems] = useState<[number]>([0]);
    const[selectedCity, setSelectedCity] = useState('0');
    const[formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });
    const[selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const[initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const[cities, setCities] = useState<string[]>([]);

    useEffect(()=>{

        api.get('items').then( response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() =>{
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([latitude, longitude]);
        });
    }, [])

    useEffect(() => {

        axios.get<ufResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);

            setUfs(ufInitials);
        });
    },
    []);

    useEffect(() => {
        if(selectedUf === '0'){
            return;
        }

        axios.get<cityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios
        `).then(response => {
            const cityNames = response.data.map(city => city.nome);

            setCities(cityNames);
        });

    },
    [selectedUf]);

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;

        setSelectedUf(uf);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;

        setSelectedUf(city);
    }

    function handleMapClick(event: LeafletMouseEvent){


        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }

    function handleSelectedItem(id: number){
        setSelectedItems([...selectedItems, id ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        
        const {name, value} = event.target;

        setFormData({...formData, [name]: value})
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>
            <form>
                <h1>Cadastro do <br/> ponto de coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input onChange={handleInputChange} type="text" name="name" id="name"/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input onChange={handleInputChange} type="email" name="email" id="email"/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input onChange={handleInputChange} type="text" name="whatsapp" id="whatsapp"/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition}/>
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado</label>
                            <select value={selectedUf} onChange={handleSelectedUf} name="uf" id="uf">
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select value={selectedCity} onChange={handleSelectedCity} name="city" id="city">
                                <option value="city">Escolha uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de Coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li onClick={() => handleSelectedItem(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                <img src={item.image_url} alt={item.name}/>
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;