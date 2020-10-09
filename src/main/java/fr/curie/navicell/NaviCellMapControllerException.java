package fr.curie.navicell;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
	public class NaviCellMapControllerException extends RuntimeException {
	    public NaviCellMapControllerException() {
	        super();
	    }
	    public NaviCellMapControllerException(String message) {
	        super(message);
	    }
	   
	}