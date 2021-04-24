package fr.curie.navicell.database.data;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
	public class NaviCellDataControllerException extends RuntimeException {
	    public NaviCellDataControllerException() {
	        super();
	    }
	    public NaviCellDataControllerException(String message) {
	        super(message);
	    }
	   
	}