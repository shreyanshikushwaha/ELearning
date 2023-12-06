import React, { FC, useState, useEffect, Component } from 'react';
import {Modal,Box} from "@mui/material";

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
    component:any;
    setRoute?:(route:string) => void;
}

const customModal: FC<Props> = ({open,setOpen,setRoute,component:Component}) => {
    return (
        <Modal
         open={open}
         
        ></Modal>
    )
}

export default customModal;