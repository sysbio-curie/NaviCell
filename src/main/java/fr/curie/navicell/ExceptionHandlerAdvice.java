
package fr.curie.navicell;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@ControllerAdvice
public class ExceptionHandlerAdvice { 

    @ExceptionHandler(NaviCellMapControllerException.class)
    public ResponseEntity handleException(NaviCellMapControllerException e) {
        // log exception 
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        
    }
} 


